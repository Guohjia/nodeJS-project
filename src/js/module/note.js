require('../../sass/note.scss')
var waterfall=require('./waterfall.js')
// console.log(waterfall)

var Toast = require('./toast.js').Toast;
var Event = require('./event.js');
var $=require('../lib/jquery-3.2.0.min.js')

function Note(options) {
    this.initOptions(options);   //初始化配置便利贴信息
    this.createNote();    //拼接字符串，新增便利贴
    this.setStyle();
    this.bindEvent();
    // this.setLayout()
}

Note.prototype = {
    colors: [
        ['#ea9b35', '#efb04e'], // headColor, containerColor
        ['#dd598b', '#e672a2'],
        ['#eee34b', '#f2eb67'],
        ['#c24226', '#d15a39'],
        ['#c1c341', '#d0d25c'],
        ['#3f78c3', '#5591d2']
    ],

    defaultOptions: {
        id: '',
        content: 'Input Here!',
        $wrapper: $('#wrapper').length > 0 ? $('#wrapper') : $('body')  //判断是否有wrapper容器存在，如果没有就用body,其实此处直接用wrapper就好，就不用每次配置信息都带上wrapper/body
    },

    initOptions: function (options) {
        this.options = $.extend({}, this.defaultOptions, options || {})
        this.options.id ? this.id = this.options.id : null;
    },

    createNote: function () {
        var template = '<div class="note">'  //一个便利贴的html
            + '<div class="note-head"><span class="delete">&times;</span></div>'
            + '<div class="note-content" contenteditable="true"></div>'   //contenteditable可修改
            + '</div>';
        this.$note = $(template);
        this.$note.find('.note-content').html(this.options.content);
        this.options.$wrapper.append(this.$note);
        if (!this.id) this.$note.css('bottom', '10px');  //新增放到右边,待新增放底部?
    },

    setStyle: function () {
        var color = this.colors[Math.floor(Math.random() * 6)];  //获取0~6的随机数字，随机设置样式
        this.$note.find('.note-head').css('background-color', color[0]);
        this.$note.find('.note-content').css('background-color', color[1]);
    },

    ///?????
    // setLayout: function () {
    //     var _this = this;
    //     console.log(this.clk)
    //     if (_this.clk) {
    //         clearTimeout(_this.clk);
    //     }
    //     _this.clk = setTimeout(function () {
    //         Event.fire('waterfall');
    //     }, 100);
    // },

    bindEvent: function () {
        var _this = this,
            $note = this.$note,
            $noteHead = $note.find('.note-head'),
            $noteContent = $note.find('.note-content'),
            $delete = $note.find('.delete');
            $addNote=$('.header .add-note')

        $delete.on('click', function () {
            _this.delete();
        })

        // console.log($addNote)
        $addNote.on('click',function(){
            _this.add()
        })

        $noteContent.on('focus', function () {
            //第一次编辑信息就清除内容；编辑已有信息就保存之前的信息在before属性上
            if($noteContent.html() == 'Input Here!'){$noteContent.html('')} 
        }).on('blur paste', function () {  //失去焦点，或者向div内粘贴文本的时候出发内容,粘贴事件ie不支持
            if ($noteContent.data('before') != $noteContent.html()) {   //文本内容有变化
                $noteContent.data('before', $noteContent.html()) //重新保存文本内容
                // _this.setLayout(); //???
                // console.log($note)
                $note.id ? _this.edit($noteContent.html()) : _this.add($noteContent.html())
            }
        });

        //设置笔记的移动
        $noteHead.on('mousedown', function (e) {
            var evtX = e.pageX - $note.offset().left,   //evtX 计算事件的触发点在 dialog内部到 dialog 的左边缘的距离
                evtY = e.pageY - $note.offset().top;
            $note.addClass('draggable').data('evtPos', { x: evtX, y: evtY }); //把事件到 dialog 边缘的距离保存下来
        }).on('mouseup', function () {   //鼠标松开拖放结束
            $note.removeClass('draggable').removeData('evtpos');
        });

        $('body').on('mousemove', function (e) {
            $('.draggable').length && $('.draggable').offset({   //$('.draggable').length代表存在拖动元素
                top: e.pageY - $('.draggable').data('evtPos').y,    // 当用户鼠标移动时，根据鼠标的位置和前面保存的距离，计算 dialog 的绝对位置
                left: e.pageX - $('.draggable').data('evtPos').x
            });
        });
    },

    edit: function (message) {
        console.log('eidt...')
        var _this = this;
        $.post('/api/notes/edit', {
            id: _this.id,
            note: message
        }).done(function (result) {
            if (result.status === 0) {
                Toast('update success');
            } else {
                Toast(result.errorMsg);
            }
        })
    },

    add:function(message){
        console.log('add...')
        var _this=this;
        $.post('/api/notes/add',{
            note: message
        }).done(function(result){
            if(result.status===0){
                Toast('add success')
            }else{
                _this.$note.remove();
                Event.fire('waterfall')
                Toast(result.errorMsg);
            }
        })
    },

    delete:function(){
        console.log('delete')
        var _this=this;
        $.post('/api/notes/delete',{id:_this.id})
        .done(function(result){
            if(result.status===0){
                Toast('delete success')
                _this.$note.remove();
                Event.fire('waterfall')
            }else{
                Toast(result.errorMsg)
            }
        })
    }
}


 module.exports.Note = Note