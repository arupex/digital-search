# digital-search
Search an Array with a Digital Tree

[![npm version](https://badge.fury.io/js/digital-search.svg)](https://badge.fury.io/js/digital-search) 
[![dependencies](https://david-dm.org/arupex/digital-search.svg)](http://github.com/arupex/digital-search) 
![Build Status](https://api.travis-ci.org/arupex/digital-search.svg?branch=master)
![lifetimeDownloadCount](https://img.shields.io/npm/dt/digital-search.svg?maxAge=95920000)


## Install

    npm install digital-search --save


## Usage

    let DigitalSearch = require('digital-search');
    
    let tree = new DigitalSearch(arrayOfObjects, {});

    opts defaults 
        {
                searchable : 'label',               // what to search on
                indexable : 'id',                   // what to index by
                partials : true,                    // allows you to search by strings that are not the begining of words ie "ton" for "boston"
                and : true,                         // forces results to have all search terms
                includeInternalProperties : true,   // includes __foundBy and __rank properties (foundBy indicates what search terms discovered this element, rank is the count
                ifNoMatchesReturnBest : false,      // specially useful for and === true, returns elements when fail, that match close by not perfect
                caseSensative : false,              // case sensativity of tree (used for tree creation and search *NOT* overridable on search call)
                minWordLength : 3                   // specially useful for partials === true, the min required characters in a partial to count
        }
    
        constructor(data, opts) 

### Adds an object into the DigitalSearch Tree    
    
    add(obj)

### Searches the Digital Search Tree

    opts inherit from tree constructor opts, these override those values per search request 
    
    opts defaults {
        searchable : 'label'
        indexable : 'id'
        partials : true
        and : true
        includeInternalProperties : true
        ifNoMatchesReturnBest : false
        minWordLength : 3
    }
    search(str, opts)

### Results

    console.log('Result', tree.search('ample'))
    
    Result [
        {
            id: '5',
            label: 'Example 1',
            __foundBy: ['ample'],
            __rank: 1
        },
        {
            id: '8',
            label: 'Example 2',
            __foundBy: ['ample'],
            __rank: 1
        }
    ]


### Loading

    tree.load('rootfilename') // loads rootfilename.map / rootfilename.tree

### Saving

    tree.save('rootfilename') // saves rootfilename.map / rootfilename.tree



## More Examples [Unit Tests](./test/quick.js)