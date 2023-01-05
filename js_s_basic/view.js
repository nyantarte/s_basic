class View{

    constructor(rootNode){}

    remove_child_nodes(rootNode){
        //現在の画面を削除
        while(0 < document.body.childNodes.length){
            document.body.childNodes[0].remove();
        }
    }
}