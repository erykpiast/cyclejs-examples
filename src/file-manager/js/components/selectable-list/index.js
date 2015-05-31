import { registerCustomElement, h, Rx } from 'cyclejs';
import { block } from 'bem-class';
import createGroup from 'cyclejs-group';

import modelDefinition from './model';


export default function createSelectableListElement(tagName) {
    let listClass = block(tagName);

    registerCustomElement(tagName, (interactions, properties) => {
        let model = createGroup(modelDefinition);

        model.inject({
            children$: properties.get('children'),
            change$: interactions.get(`.${listClass.element('checkbox')}`, 'change')
                .map(({ target }) => ({
                    id: target.id,
                    selected: target.checked
                })),
            selectAll$: interactions.get(`.${block('select-all')}`, 'change')
                .map(({ target }) => target.checked)
        }, model);

        let vtree$ = Rx.Observable.combineLatest(
            model.options$,
            model.allSelected$,
            (options, allSelected) =>
                h('div', {
                    className: listClass.element('container')
                }, [
                    h('input', {
                        className: block('select-all').toString(),
                        type: 'checkbox',
                        checked: allSelected
                    }),
                    h('ul', {
                        className: listClass.toString()
                    }, options.map(({ id, selected, element }) =>
                        h('li', {
                            key: id,
                            className: listClass.element('option').modifier({
                                selected
                            }).toString()
                        }, [
                            h('input', {
                                className: listClass.element('checkbox').toString(),
                                type: 'checkbox',
                                checked: selected,
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