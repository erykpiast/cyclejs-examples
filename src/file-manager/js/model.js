import { Rx } from 'cyclejs';


export default {
    files$: (selectedOptions$, initialFiles$, files$, fileNameChange$) =>
        Rx.Observable.merge(
            selectedOptions$
                .withLatestFrom(
                    files$,
                    (selectedFiles, files) =>
                        files.map(({ fileName, uuid }) => ({
                            fileName,
                            uuid,
                            selected: selectedFiles.indexOf(uuid) !== -1
                        }))
                ),
            fileNameChange$
                .withLatestFrom(
                    files$,
                    (nameChange, files) =>
                        files.map((file) =>
                            nameChange.uuid === file.uuid ? ({
                                fileName: nameChange.fileName,
                                uuid: file.uuid,
                                selected: file.selected
                            }) : file
                        )
                ),
            initialFiles$
        ).distinctUntilChanged((files) =>
            JSON.stringify(files)
        ),
    renameMode$: (renameButtonClick$) =>
        renameButtonClick$
            .scan(false, (previous) =>
                !previous
            )
            .startWith(false)
            .distinctUntilChanged(),
    anyFileSelected$: (selectedOptions$) =>
        selectedOptions$
            .map((options) => !!options.length)
            .startWith(false)
            .distinctUntilChanged()
};

//