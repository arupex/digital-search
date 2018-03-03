/**
 * Created by daniel.irwin on 3/6/17.
 */


describe('Quck Test', function () {

    let DigitalTree = require('../digitalsearch');
    let expect = require('assert').deepEqual;

    let list = [
        {id: '1', label: 'a'},
        {id: '2', label: 'aa'},
        {id: '3', label: 'test'},
        {id: '4', label: 'boston properties'},
        {id: '5', label: 'Boston Properties2'},
        {id: '6', label: 'Vivek Systems'},
        {id: '7', label: 'Vivek Properties'},
        {id: '8', label: 'Boston Dynamics'},
        {id: '9', label: 'z'}
    ];

    let tree = new DigitalTree(list, {searchable: 'label', indexable: 'id', partials: true});

    let treeCaseSensative = new DigitalTree(list, {
        searchable: 'label',
        indexable: 'id',
        partials: true,
        caseSensative: true
    });

    it('partial case sensative find things because of case', function () {
        expect(treeCaseSensative.search('ton ties', {and: true}), [
            {
                id: '4',
                label: 'boston properties',
                __foundBy: ['ton', 'ties'],
                __rank: 2
            },
            {
                id: '5',
                label: 'Boston Properties2',
                __foundBy: ['ton', 'ties'],
                __rank: 2
            }
            // {id: '7', label: 'Vivek Properties'}
        ]);
    });

    it('partial case sensative find nothing because of case', function () {
        expect(treeCaseSensative.search('Ton Ties', {and: true}), []);
    });

    it('partial case sensative find prefix', function () {
        expect(treeCaseSensative.search('Boston', {and: true}), [
            {
                id: '5',
                label: 'Boston Properties2',
                __foundBy: ['Boston'],
                __rank: 1
            },
            {
                id: '8',
                label: 'Boston Dynamics',
                __foundBy: ['Boston'],
                __rank: 1
            }
            // {id: '7', label: 'Vivek Properties'}
        ]);
    });


    it('partial!', function () {
        expect(tree.search('ton ties', {and: true}), [
            {
                id: '4',
                label: 'boston properties',
                __foundBy: ['ton', 'ties'],
                __rank: 2
            },
            {
                id: '5',
                label: 'Boston Properties2',
                __foundBy: ['ton', 'ties'],
                __rank: 2
            }
            // {id: '7', label: 'Vivek Properties'}
        ]);
    });


    it('partial! no and', function () {
        expect(tree.search('ton ties', {and: false}), [
            {
                id: '4',
                label: 'boston properties',
                __foundBy: ['ton', 'ties'],
                __rank: 2
            },
            {
                id: '5',
                label: 'Boston Properties2',
                __foundBy: ['ton', 'ties'],
                __rank: 2
            },
            {
                id: '7',
                label: 'Vivek Properties',
                __foundBy: ['ties'],
                __rank: 1
            },
            {
                id: '8',
                label: 'Boston Dynamics',
                __foundBy: ['ton'],
                __rank: 1
            },
        ]);
    });


    it('2 words anded', function () {
        expect(tree.search('Boston Properties', {and: true}), [
            {
                id: '4',
                label: 'boston properties',
                __foundBy: ['boston', 'properties'],
                __rank: 2
            },
            {
                id: '5',
                label: 'Boston Properties2',
                __foundBy: ['boston', 'properties'],
                __rank: 2
            }
        ]);
    });

    it('first word', function () {
        expect(tree.search('Boston', {and: true}), [
            {
                id: '4',
                label: 'boston properties',
                __foundBy: ['boston'],
                __rank: 1
            },
            {
                id: '5',
                label: 'Boston Properties2',
                __foundBy: ['boston'],
                __rank: 1
            },
            {
                id: '8',
                label: 'Boston Dynamics',
                __foundBy: ['boston'],
                __rank: 1
            }
        ]);
    });

    it('second word', function () {
        expect(tree.search('Properties', {and: true}), [
            {
                id: '4',
                label: 'boston properties',
                __foundBy: ['properties'],
                __rank: 1
            },
            {
                id: '5',
                label: 'Boston Properties2',
                __foundBy: ['properties'],
                __rank: 1
            },
            {
                id: '7',
                label: 'Vivek Properties',
                __foundBy: ['properties'],
                __rank: 1
            }
        ]);
    });

    it('completely different first word but same second word', function () {
        expect(tree.search('Vivek Properties', {and: true}), [
            {
                id: '7',
                label: 'Vivek Properties',
                __foundBy: ['vivek', 'properties'],
                __rank: 2
            }
        ]);
    });

    it('completely different both words', function () {
        expect(tree.search('Vivek Systems', {and: true}), [
            {
                id: '6',
                label: 'Vivek Systems',
                __foundBy: ['vivek', 'systems'],
                __rank: 2
            }
        ]);
    });


    it('completely impossible', function () {
        expect(tree.search('Vivek Systems Aperture Corp', {and: true, ifNoMatchesReturnBest: true}), [
            {
                id: '6',
                label: 'Vivek Systems',
                __foundBy: ['vivek', 'systems'],
                __rank: 2
            },
            {
                id: '7',
                label: 'Vivek Properties',
                __foundBy: ['vivek'],
                __rank: 1
            }
        ]);
    });

    it('completely impossible2', function () {
        expect(tree.search('Vivek Systems Aperture Corp', {and: true, ifNoMatchesReturnBest: false}), []);
    });


});