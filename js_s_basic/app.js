

class App{

    current_source_code="DIM A";
    current_view=null;



    compile(source_code){
        this.current_source_code=source_code;
        (new BasicParser(this.current_source_code));
        this.current_view=new CompileResult();
    }
}


var app=new App();
function init(){
    app.current_view=new ScriptEditor(document.body);
}