import { registerCustomElement, h, Rx } from 'cyclejs';

export default function confirm(tagName) {
    let popupClass = tagName;
    let contentContainerClass = tagName + '__content';
    let buttonsContainerClass = tagName + '__nav';
    let buttonClass = popupClass + '__button';
    let confirmButtonClass = buttonClass + '--confirm';
    let cancelButtonClass = buttonClass + '--cancel';

    registerCustomElement(tagName, (interactions, properties) => ({
        vtree$: Rx.Observable.combineLatest(
                properties.get('children'),
                properties.get('messages')
                    .map(({ confirm, cancel }) => ({
                        confirm: confirm || 'Yes',
                        cancel: cancel || 'No'
                    })),
                (content, { confirm: confirmMessage, cancel: cancelMessage }) =>
                    h('form', {
                        className: `${popupClass}`
                    }, [
                        h('div', {
                            className: `${contentContainerClass}`
                        }, content),
                        h('nav', {
                            className: `${buttonsContainerClass}`
                        }, [
                            h('button', {
                                className: `${cancelButtonClass}`,
                                type: 'button'
                            }, cancelMessage),
                            h('button', {
                                type: 'submit',
                                className: `${confirmButtonClass}`
                            }, confirmMessage)
                        ])
                    ])
                ),
            cancel$: interactions.get(`.${cancelButtonClass}`, 'click')
                .tap((e) => e.preventDefault())
                .map(() => true),
            confirm$: interactions.get(`.${popupClass}`, 'submit')
                .tap((e) => e.preventDefault())
        })
    );

}