

export default {
    options$: (children$, change$, selectAll$, options$) =>
        change$.withLatestFrom(
            options$.delay(1),
            (change, options) =>
                options.map(({ element, id, selected }) => ({
                    id,
                    element,
                    selected: change.id === id ?
                        change.selected :
                        selected
                }))
        )
        .merge(
            selectAll$.withLatestFrom(
                options$.delay(1),
                (selected, options) =>
                    options.map(({ element, id }) => ({
                        id,
                        element,
                        selected
                    }))
            )
        )
        .distinctUntilChanged((options) =>
            JSON.stringify(options.map(({ id, selected }) => ({
                id, selected
            })))
        )
        // distinctUntilChanged must be above
        // change of children has to force rerender, even if selection wasn't changed
        .merge(children$),
    selectedOptions$: (options$) =>
        options$
            .map((options) =>
                options.filter(({ selected }) => selected)
            )
            .distinctUntilChanged((selectedOptions) =>
                JSON.stringify(selectedOptions.map(({ id }) => id))
            )
            .map((options) =>
                options.map(({ element }) => element)
            ),
    allSelected$: (options$) =>
        options$.map((options) =>
            !!options.length && options.every(({ selected }) => selected)
        )
        .distinctUntilChanged()
};