import { Rx, h, applyToDOM } from 'cyclejs';
import { v1 as uuid } from 'uuid';
import { block } from 'bem-class';

import selectableListComponent from './components/selectable-list';


selectableListComponent('selectable-list');


let files$ = Rx.Observable.just(
    [ 'file1.txt', 'file2.jpg', 'file3.doc' ]
        .map((fileName) => ({
            fileName,
            uuid: uuid()
        }))
);


function computer(interactions) {
    let listId = uuid();
    let listClass = block('files');

    interactions.get(`.${listClass}`, 'selectedOptions')
        .map(({ data: elements }) =>
            elements.map((element) => element.properties.id)
        )
        .withLatestFrom(
            files$,
            (selectedFiles, files) =>
                files.filter((file) =>
                    selectedFiles.indexOf(file.uuid) !== -1
                )
                .map(({ fileName }) => fileName)
        )
        .subscribe(console.log.bind(console, 'selected files'));

    return files$
        .map((files) => h('div',
            h('selectable-list', {
                key: listId,
                className: listClass.toString()
            }, files.map((file) =>
                h('p', {
                    id: file.uuid,
                    selected: !!Math.round(Math.random()),
                    className: listClass.toString()
                }, file.fileName)
            ))
        ));
}

export default function fileManagerApp(dom) {
    applyToDOM(dom, computer);
}