

export default {
    value$: (initialValue$, apply$, input$) =>
        apply$.withLatestFrom(input$, (apply, input) => input)
        .merge(initialValue$)
};