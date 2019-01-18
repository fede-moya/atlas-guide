'use strict';

const path = require('path');
const fs = require('fs');
const assert = require('assert');
const cwd = process.cwd();

describe('Build', function() {
    const guideDest = 'test/results/';
    let initialConfig = '';

    before(function() {
        initialConfig = fs.readFileSync('.atlasrc.json');
        fs.writeFileSync('.atlasrc.json', `
                {
                    "guideSrc": "test/fixtures/atlas/",
                    "guideDest": "${guideDest}",
                    "cssSrc": "test/fixtures/atlas/css",
                    "copyInternalAssets": false,
                    "excludedSassFiles": "^excluded",
                    "excludedCssFiles": "^excluded",
                    "partials": {
                      "assetsfooter": "test/fixtures/includes/assetsfooter.mustache",
                      "assetshead": "test/fixtures/includes/assetshead.mustache"
                    },
                    "templates": {
                        "guide": "test/fixtures/templates/guide.mustache"
                    }
                }
            `, 'utf8');
        fs.unlinkSync(path.join(cwd, guideDest, '.gitkeep'));
    });

    after(function() {
        fs.writeFileSync('.atlasrc.json', initialConfig, 'utf8');
        fs.writeFileSync(path.join(cwd, guideDest, '.gitkeep'), '', 'utf8');
    });

    describe('Single component', function() {
        describe('Existed absolute path', function() {
            const expectedFile = path.join(cwd, guideDest, 'component.html');

            before(function(done) {
                const atlas = require(cwd + '/app/atlas-guide');
                atlas.build(path.join(cwd, '/test/fixtures/atlas/_component.scss')).then(() => done()); // eslint-disable-line
            });

            after(function() {
                fs.unlinkSync(expectedFile);
            });

            it('should be written', function() {
                const generatedFile = fs.existsSync(expectedFile);
                assert.strictEqual(generatedFile, true, 'component file exist');
            });

            it('only one file should be written', function() {
                const actualFiles = fs.readdirSync(guideDest);
                assert.deepEqual(actualFiles, ['component.html']);
            });

            it('should be with content', function() {
                const expectedFileContent = fs.readFileSync(expectedFile, 'utf8');
                const result = /h1-b-component-test/.test(expectedFileContent);
                assert.strictEqual(result, true, 'component file have expected content');
            });

            it('should have overloaded partials', function() {
                const expectedFileContent = fs.readFileSync(expectedFile, 'utf8');
                const head = /project.css/.test(expectedFileContent);
                const footer = /project.js/.test(expectedFileContent);
                assert.strictEqual(footer && head, true, 'component file have overloaded template');
            });
        });

        describe('Existed relative path', function() {
            const expectedFile = path.join(cwd, guideDest, 'component-deprecated.html');

            before(function(done) {
                const atlas = require(cwd + '/app/atlas-guide');
                atlas.build('./test/fixtures/atlas/_component-deprecated.scss').then(() => done()); // eslint-disable-line
            });

            after(function() {
                fs.unlinkSync(expectedFile);
            });

            it('should be written', function() {
                const generatedFile = fs.existsSync(expectedFile);
                assert.strictEqual(generatedFile, true, 'component file exist');
            });

            it('should be with content', function() {
                const expectedFileContent = fs.readFileSync(expectedFile, 'utf8');
                const result = /h1-b-component-deprecated/.test(expectedFileContent);
                assert.strictEqual(result, true, 'component file have expected content');
            });
        });

        describe('Wrong path', function() {
            it('should not trow an error on unexisted file with relative path', function(done) {
                try {
                    const atlas = require(cwd + '/app/atlas-guide');
                    atlas.build('./test/fixtures/atlas_component.scss').then(() => done()); // eslint-disable-line
                } catch (e) {
                    done('failed');
                }
            });
            it('should not trow an error on unexisted file with absolute path', function(done) {
                try {
                    const atlas = require(cwd + '/app/atlas-guide');
                    atlas.build(path.join(cwd, '/test/fixtures/atlas/_some.scss')).then(() => done()); // eslint-disable-line
                } catch (e) {
                    done('failed');
                }
            });
            it('should not trow an error on directory path', function(done) {
                try {
                    const atlas = require(cwd + '/app/atlas-guide');
                    atlas.build('./test/fixtures/atlas/').then(() => done()); // eslint-disable-line
                } catch (e) {
                    done('failed');
                }
            });
        });

        describe('Should not write file with not changed content', function() {
            const expectedFile = path.join(cwd, guideDest, 'category-component.html');

            beforeEach(function(done) {
                const atlas = require(cwd + '/app/atlas-guide');
                atlas.build(path.join(cwd, '/test/fixtures/atlas/category/_component.scss')).then(() => done()); // eslint-disable-line
            });

            it('should be written', function() {
                const generatedFile = fs.existsSync(expectedFile);
                assert.strictEqual(generatedFile, true, 'component file exitst');
                fs.unlinkSync(expectedFile);
            });

            it('should not be written', function() {
                const generatedFile = fs.existsSync(expectedFile);
                assert.strictEqual(generatedFile, false, 'component file not exitst');
            });
        });
    });

    describe('Components pages', function() {
        before(function(done) {
            const atlas = require(cwd + '/app/atlas-guide');
            atlas.build().then(() => done());
        });
        after(function() {
            fs.readdirSync(guideDest).forEach(item => {
                fs.unlinkSync(path.join(cwd, guideDest, item));
            });
        });

        it('should generate all components pages', function() {
            const actualFiles = fs.readdirSync(guideDest);
            const expected = [
                'category-component-no-stat.html',
                'category-component.html',
                'category-doc-guide.html',
                'component-deprecated.html',
                'component.html',
                'doc-guide.html',
                'index.html'
            ];
            assert.deepEqual(actualFiles, expected);
        });
    });
});
