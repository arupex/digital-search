/**
 * Created by daniel.irwin on 3/6/17.
 */

'use strict';

class DigitalSearch {

    constructor(data, opts) {
        opts = opts || {};
        this.tree = {
            root: true
        };


        this.searchable = opts.searchable || 'label';
        this.indexable = opts.indexable || 'id';
        this.partials = typeof opts.partials === 'boolean' ? opts.partials : true;
        this.and = typeof opts.and === 'boolean' ? opts.and : true;
        this.includeInternalProperties = typeof opts.includeInternalProperties === 'boolean' ? opts.includeInternalProperties : true;
        this.ifNoMatchesReturnBest = typeof opts.ifNoMatchesReturnBest === 'boolean' ? opts.ifNoMatchesReturnBest : false;

        this.caseSensative = typeof opts.caseSensative === 'boolean' ? opts.caseSensative : false;

        this.minWordLength = typeof opts.minWordLength === 'number' ? opts.minWordLength : 3;

        this.map = {};

        this.addMany(data);
    }

    /**
     * Loads 2 files
     *  - Tree
     *  - Map
     * @param fileName
     */
    load (fileName) {
        const mapSetter = (err, e) => this.setMap(JSON.parse(e));
        const treeSetter =  (err, e) => this.setTree(JSON.parse(e));

        if(typeof require === 'function') {
            let fs = require('fs');
            fs.readFile(`${fileName}.map`, 'utf8', mapSetter);
            fs.readFile(`${fileName}.tree`, 'utf8', treeSetter);
        }
        else {
            this.__doHttpCall('GET', `${fileName}.map`, mapSetter);
            this.__doHttpCall('GET', `${fileName}.tree`, treeSetter);
        }
    }

    __doHttpCall (method, url, cb) {
        const http = new XMLHttpRequest();
        http.open(method, url);
        http.send();
        http.onload = () => cb(http.responseText);
    }

    getTree () {
        return this.tree;
    }

    getMap () {
        return this.map;
    }

    setTree (tree) {
        this.tree = tree;
    }

    setMap (map) {
        this.map = map;
    }


    /**
     * Saves 2 files
     *  - Tree
     *  - Map
     * @param fileName
     */
    save (fileName) {
        if(typeof require === 'function') {
            let fs = require('fs');
            fs.writeFileSync(`${fileName}.map`, JSON.stringify(this.map, null, 3), 'utf8');
            fs.writeFileSync(`${fileName}.tree`, JSON.stringify(this.tree, null, 3), 'utf8');
        }
    }

    addMany (data) {
        if (data && Array.isArray(data)) {
            data.forEach((el) => {
                this.add(el);
            });
        }
    }

    add(obj) {

        let depths = [this.tree];
        if (obj[this.searchable]) {
            this.map[obj[this.indexable]] = obj;
            let str = this.caseSensative?obj[this.searchable]:obj[this.searchable].toLowerCase();
            let i = 0;
            for (; i < str.length; ++i) {
                //move back to root
                if (str[i] === ' ' || str[i] === '\n') {
                    depths.forEach((depth) => {
                        this.addObjRefToTreeRef(depth, obj);
                    });
                    depths = [this.tree];
                }
                else {
                    depths.forEach((depth, z) => {
                        if (!depth[str[i]]) {
                            depth[str[i]] = {};
                        }
                        depths[z] = depth[str[i]];

                        if (this.partials) {
                            this.addObjRefToTreeRef(depths[z], obj);
                        }
                    });

                    if (this.partials) {//recurse back to root but keep old reference pointers as well! its crrrrraaazy
                        depths.push(this.tree);
                    }
                }

            }
            depths.forEach((depth) => {
                this.addObjRefToTreeRef(depth, obj);
            });
        }
    }

    addObjRefToTreeRef(depth, obj) {
        if (!depth.root) {
            if (!depth.leaf) {
                depth.leaf = [];
            }
            depth.leaf.push(obj[this.indexable]);
        }
    }


    cleanResults(results) {
        let output = {};
        results.forEach((result) => {
            let query = result.query;
            let data = result.data;
            if (query) {
                data.forEach(elementId => {

                    if (!output[elementId]) {
                        output[elementId] = {
                            data: this.map[elementId],
                            hits: 1,
                            foundBecause: [query]
                        };
                    }
                    else if (output[elementId].foundBecause.indexOf(query) === -1) {
                        output[elementId].foundBecause.push(query);

                        output[elementId].hits++;
                    }

                });
            }
        });

        return Object.keys(output).map((dataId) => {
            let d = output[dataId].data;
            d.__rank = output[dataId].hits;
            d.__foundBy = output[dataId].foundBecause;
            return d;

        });
    }

    search(str, opts) {
        opts = opts || {};
        str = this.caseSensative?str:str.toLowerCase();

        let deep = this.tree;
        let results = [];
        let last = 0;
        let words = 0;
        for (let i = 0; i < str.length; ++i) {

            if (str[i] === ' ' || str[i] === '\n') {
                words++;

                this.addObjToResults(deep, i, last, opts, results, str);
                last = i + 1;
                deep = this.tree;
            }
            else if (i === str.length - 1) {
                words++;
                if (deep[str[i]]) {
                    deep = deep[str[i]];
                }
                this.addObjToResults(deep, i + 1, last, opts, results, str);

            }
            else if (deep[str[i]]) {
                deep = deep[str[i]];
            }
            else {
                deep = {YOU_SHALL_NOT_PASS: true};
            }
        }


        let cResults = this.cleanResults(results);

        if (opts && typeof opts.and === 'boolean' ? opts.and : this.and) {
            let tmp = cResults.filter((a) => {
                return a.__rank >= words;
            });
            if (typeof opts.ifNoMatchesReturnBest === 'boolean' ? opts.ifNoMatchesReturnBest : this.ifNoMatchesReturnBest && tmp.length === 0) {
                //dont do anything?
            }
            else {
                cResults = tmp;
            }
        }

        if (opts && typeof opts.includeInternalProperties === 'boolean' ? opts.includeInternalProperties : this.includeInternalProperties) {
            return cResults;
        }

        return cResults.map((el) => {

            delete el.__rank;
            delete el.__foundBy;
            return JSON.parse(JSON.stringify(el));

        });
    }

    addObjToResults(deep, i, last, opts, results, str) {
        let word = str.slice(last, i);
        if (!deep.root && deep.leaf && ((i + 1 - last) >= typeof opts.minWordLength === 'number' ? opts.minWordLength : this.minWordLength)) {

            results.push({
                query: word,
                data: deep.leaf
            });
        }
    }
}


if (typeof module !== 'undefined') {
    module.exports = DigitalSearch;
}