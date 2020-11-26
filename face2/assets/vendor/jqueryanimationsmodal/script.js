$('.button').click(function () {
  debugger
  var buttonId = $(this).attr('id');
  $('#databoardModal').removeAttr('class').addClass(buttonId);
  $('body').addClass('modal-active');
})

$('#databoardModal').click(function(){
  debugger
  $(this).addClass('out');
  $('body').removeClass('modal-active');
});