import { Rx, h, applyToDOM } from 'cyclejs';
import createGroup from 'cyclejs-group';


// functional style console.log
global.log = function log(...args) {
    return console.log.bind(console, ...args);
};


function computer(interactions) {
    

    let model = createGroup({
        list$: (initialList$, addItem$, newItemName$, list$) =>
            Rx.Observable.merge(
                addItem$.tap(log('addItem$')).withLatestFrom(newItemName$, list$, (add, newItem, list) =>
                    [ newItem ].concat(list)
                ),
                initialList$
            ).tap(log('list$')),
        addingMode$: (turnOnAddingMode$, addItem$) =>
            Rx.Observable.merge(
                turnOnAddingMode$.map(() => true),
                addItem$.map(() => false)
            ).startWith(false)
            .tap(log('addingMode$'))
    });
    model.inject({
            initialList$: Rx.Observable.just([ 'abc', 'def', 'xyz' ]),
            turnOnAddingMode$: interactions.get('.add', 'click'),
            addItem$: interactions.get('.confirm-add', 'click'),
            newItemName$: interactions.get('.new-item-name', 'input')
                .map(({ target }) => target.value)
        }, model
    );

    return Rx.Observable.combineLatest(
        model.list$,
        model.addingMode$,
        (list, addingMode) =>
            h('div', [
                h('div', addingMode ? [
                        h('input', {
                            type: 'text',
                            className: 'new-item-name',
                            value: Math.floor(Math.random() * 10e10).toString(31)
                        }),
                        h('button', {
                            className: 'confirm-add'
                        }, 'Add')
                    ] : h('button', {
                        className: 'add'
                    }, 'Add item')
                ),
                h('ul', {
                    }, list.map((item) =>
                        h('li', { }, item)
                    )
                )
            ]
        )
    );
}

export default function fileManagerApp(dom) {
    applyToDOM(dom, computer);
}