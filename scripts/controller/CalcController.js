class CalcController {

    constructor(){
        
        this._audio = new Audio('click.mp3');
        this._audioOnOff = false;
        this._lastOperator = '';
        this._lastNumber = '';
        this._operation = [];
        this._locale = 'pt-BR';
        this._displayCalcEl = document.querySelector("#display"); //seleção do id do display lá do documento HTML
        this._dateCalcEl = document.querySelector("#data"); //seleção do id da data lá do documento HTML
        this._timeCalcEl = document.querySelector("#hora"); //seleção do id da hora lá do documento HTML
        this._currentDate;
        this.initialize();
        this.initButtonsEvents();
        this.initKeyboard();
        

    }

    pasteFromClipboard(){
        document.addEventListener('paste', e =>{
            let text = e.clipboardData.getData('Text');

            this.displayCalc = parseFloat(text);
        });
    }

    copyToClipboard(){
        let input = document.createElement('input');

        input.value = this.displayCalc;

        document.body.appendChild(input);

        input.select();

        document.execCommand("Copy");

        input.remove();


    }

    initialize(){
        
        this.setDisplayDateTime(); //função que inicializa o relógio sem que apareça em branco o primeiro segundo do tempo
        
        setInterval(()=>{
            this.setDisplayDateTime(); //continua o contador do relógio
        }, 1000)

        this.setLastNumberToDisplay();
        this.pasteFromClipboard();

        document.querySelectorAll('.btn-ac').forEach(btn => {
            btn.addEventListener('dblclick', e => { //ao dar clik duplo, aciona o metodo abaixo
                this.toggleAudio();
            });
        });
    }

    toggleAudio(){

        this._audioOnOff = (this._audioOnOff) ? false : true; //poderia ser: this._audioOnOff = !this._audioOnOff
    }

    playAudio(){
        if (this._audioOnOff){
            this._audio.currentTime = 0; //serve para tocar o audio quando tecla for pressionada uma atrás da outra, sem atrasos ou esperar o primeiro som do clcik concluir
            this._audio.play();
        }
    }

    initKeyboard(){
        document.addEventListener('keyup', e => {

            this.playAudio();
            
            switch(e.key){
                case 'Escape':
                    this.clearAll();
                    break;
    
                case 'Backescape':
                    this.clearEntry();
                    break;
                
                case '+':
                case '-':
                case '*':
                case '/':
                case '%':
                    this.addOperation(e.key);
                    break;
    
                case 'Enter':
                case '=':
                    this.calc();
                    break;
    
                case '.':
                case ',':
                    this.addDot('.');
                    break;
                
                case '0': 
                case '1': 
                case '2': 
                case '3': 
                case '4': 
                case '5': 
                case '6': 
                case '7': 
                case '8': 
                case '9': 
    
                    this.addOperation(parseInt(e.key));
                    break;

                case 'c':
                    if (e.ctrlKey) this.copyToClipboard();
                    break;
                
            }
        });

    }

    addEventListenerAll(element, events, fn){ //método para entender a ação de quando clicar e arrastar o botão, caso digite rápido

        events.split(' ').forEach(event => { //split divide/transforma a string em array. Foreach usado pq virou um array
            element.addEventListener(event, fn, false);
        });
    }

    clearAll(){
        this._operation = []; //nesse caso, vai zerar o arrey, apagando tudo na tela
        this._lastNumber = ''; //zerando
        this._lastOperator = ''; //zerando
        this.setLastNumberToDisplay();

    }

    clearEntry(){
        this._operation.pop(); //elimina o último dado do arrey
        this.setLastNumberToDisplay();
    }

    getLastOperation(){
        return this._operation[this._operation.length-1]; //retorna o dado da ultima posição do arrey. -1 para que elimine a ultima ação, pois pode armazenar um +, *... dependendo da operação feita, pois tudo é por base numa string que será convertida
    }

    setLastOperation(value){
        this._operation[this._operation.length - 1] = value;
    }

    isOperator(value){ //verifica, como se fosse um for, se operador está nesse array. retorna a posiçao (index) do arrey que o operador está
        return (['+', '-', '*', '%', '/'].indexOf(value) > -1); //retorna false ou true, onde verifica o index > -1.
    }

    pushOperation(value){
        this._operation.push(value);

        if(this._operation.length > 3){

            this.calc();
        }
    }

    getResult(){
        try{
        return eval(this._operation.join(""));
        }catch(e){
            setTimeout(() =>{

            }, 1);
            
        }
    }

    calc(){

        let last = '';

        this._lastOperator = this.getLastItem();

        if (this._operation.length < 3) {

            let firstItem = this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber];
        }

        if (this._operation.length > 3){
            last = this._operation.pop(); //remove o último e guarda em last
            this._lastNumber = this.getResult();

        }else if (this._operation.length == 3){
            
            this._lastNumber = this.getLastItem(false);

        }        
        
        let result = this.getResult();

        if (last == '%'){

            result /= 100; //poderia ser result /= result / 100

            this._operation = [result];

        }else {
            this._operation = [result];

            if (last) this._operation.push(last);
        }

        this.setLastNumberToDisplay(); //mostra o resultado da operação na tela

    }

    getLastItem(isOperator = true){
        let lastItem;

        for (let i = (this._operation.length-1); i >=0; i--){
         
            if(this.isOperator(this._operation[i]) == isOperator ){
                lastItem = this._operation[i];
                break;
            }
           
        } 

        if(!lastItem){
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
        }

        return lastItem;
    }

    setLastNumberToDisplay(){
        
        let lastNumber = this.getLastItem(false);

        if(!lastNumber) lastNumber = 0; //se lastnumber for vazio, entao será 0 e mostrará isso no display

        this.displayCalc = lastNumber;

    }

    addOperation(value){ //método para juntar numeros.O value vem dos case do switch. Transforma em string e depois converte em numeral
        
        if (isNaN(this.getLastOperation())){ 
            
            if(this.isOperator(value)){ //recebe false ou true. Só executa se for true. Serve p/ verificar se o último digitado é um operador ou não. Se for, fará a troca
                this.setLastOperation(value)

            } else if(isNaN(value)){
                console.log('outra coisa', value);

            }else {
                this.pushOperation(value);
                this.setLastNumberToDisplay();
            }

        }else{

            if (this.isOperator(value)){

                this.pushOperation(value);

            } else {
                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(newValue);

                this.setLastNumberToDisplay();

            }

            
        }
        
    }
    
    setError(){
        this.displayCalc = "Error";
    }

    addDot(){
        let lastOperation = this.getLastOperation();
        
        if (typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;

        if (this.isOperator(lastOperation) || !lastOperation){
            this.pushOperation('0.');
        } else {
            this.setLastOperation(lastOperation.toString() + '.');
        }

        this.setLastNumberToDisplay();
    }

    execBtn(value){
        
        this.playAudio();
        
        switch(value){
            case 'ac':
                this.clearAll();
                break;

            case 'ce':
                this.clearEntry();
                break;
            
            case 'soma':
                this.addOperation('+');
                break;

            case 'subtracao':
                this.addOperation('-');
                break;

            case 'multiplicacao':
                this.addOperation('*');
                break;

            case 'divisao':
                this.addOperation('/');
                break;

            case 'porcento':
                this.addOperation('%');
                break;

            case 'igual':
                this.calc();
                break;

            case 'ponto':
                this.addDot('.');
                break;
            
            case '0': //0 é uma string, do texto do botão lá do HTML (DOM)
            case '1': //1 é uma string, do texto do botão lá do HTML (DOM)
            case '2': //2 é uma string, do texto do botão lá do HTML (DOM)
            case '3': //3 é uma string, do texto do botão lá do HTML (DOM)
            case '4': //4 é uma string, do texto do botão lá do HTML (DOM)
            case '5': //5 é uma string, do texto do botão lá do HTML (DOM)
            case '6': //6 é uma string, do texto do botão lá do HTML (DOM)
            case '7': //7 é uma string, do texto do botão lá do HTML (DOM)
            case '8': //8 é uma string, do texto do botão lá do HTML (DOM)
            case '9': //9 é uma string, do texto do botão lá do HTML (DOM)

                this.addOperation(parseInt(value)); //transforma o dado da string em int
                break;
            
            default:
                this.setError();
                break;
        }
    }
    
    initButtonsEvents(){
        let buttons = document.querySelectorAll("#buttons > g, #parts > g"); //buttons é como se fosse uma lista de botões. > é para o filho

        buttons.forEach(btn =>{

            this.addEventListenerAll(btn, "click drag", e => { //caso queira saber a posição, coloca o index. Drag é sobre arrastar o botão
                let textBtn = btn.className.baseVal.replace("btn-", ""); //variável que armazena só a string (nome) da classe lá do HTML e replace faz a substituição do btn- para vazio
                this.execBtn(textBtn);
            });

            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e => { //método que muda o cursor de seta para a mãozinha
                btn.style.cursor = "pointer" //pointer é a mãozinha
            });
        });
    }

    setDisplayDateTime(){ //função do relógio e da data configurada para o locale.
        this.displayDate = this.currentDate.toLocaleDateString(this._locale, {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
    }

    get displayTime(){
        return this._timeCalcEl.innerHTML;
    }

    set displayTime(value){
        return this._timeCalcEl.innerHTML = value;
    }

    get displayDate(){
        return this._dateCalcEl.innerHTML;
    }

    set displayDate(value){
        return this._dateCalcEl.innerHTML =  value;
    }

    get displayCalc(){ //ao chamar ele, aparecerá o que está armazenado. Ex.: calculator.displayCalc
        return this._displayCalcEl.innerHTML;
    }

    set displayCalc(value){ //ao chamá-lo passando/recebendo um valor, armazenará o valor. Ex.: calculator.displayCalc = 1. Guarda o 1
        
        if (value.toString().length > 10){
            this.setError();
            return false;
        }
        this._displayCalcEl.innerHTML = value;
    }

    get currentDate(){
        return new Date();
    }

    set currentDate(value){
        this._currentDate = value;
    }
}