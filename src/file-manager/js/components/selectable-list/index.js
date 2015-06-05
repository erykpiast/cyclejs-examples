import { registerCustomElement, h, Rx } from 'cyclejs';
import createGroup from 'cyclejs-group';

import modelDefinition from './model';

// function log(...args) {
//     return console.log.bind(console, ...args);
// }


export default function createSelectableListElement(tagName) {
    let listClass = tagName;
    let containerClass = listClass + '__container';
    let optionClass = listClass + '__option';
    let optionCheckboxClass = listClass + '__option__checkbox';
    let selectedOptionClass = optionClass + '--selected';
    let selectAllClass = 'select-all';

    registerCustomElement(tagName, (interactions, properties) => {
        let model = createGroup(modelDefinition);

        model.inject({
            children$: properties.get('children')
                .map((children) =>
                    children.map((child) => ({
                        id: child.properties.id,
                        selected: child.properties.selected,
                        element: child
                    }))
                ),
            change$: interactions.get(`.${optionCheckboxClass}`, 'change')
                .map(({ target }) => ({
                    id: target.id,
                    selected: target.checked
                })),
            selectAll$: interactions.get(`.${selectAllClass}`, 'change')
                .map(({ target }) => target.checked)
        }, model);

        let vtree$ = Rx.Observable.combineLatest(
            model.options$,
            model.allSelected$,
            properties.get('disabled'),
            (options, allSelected, disabled) =>
                h('div', {
                    className: `${containerClass}`
                }, [
                    h('input', {
                        className: `${selectAllClass}`,
                        type: 'checkbox',
                        checked: allSelected,
                        disabled: disabled
                    }),
                    h('ul', {
                        className: `${listClass}`
                    }, options.map(({ id, selected, element }) =>
                        h('li', {
                            key: id,
                            className: selected ? selectedOptionClass : optionClass
                        }, [
                            h('input', {
                                className: `${optionCheckboxClass}`,
                                type: 'checkbox',
                                checked: selected,
                                disabled: disabled,
                                id: id,
                                key: id
                            }),
                            element
                        ])
                    ))
                ]
            )
        );

        return {
            vtree$,
            selectedOptions$: model.selectedOptions$
        };
    });

}