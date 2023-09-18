Stripe.setPublishableKey('pk_test_51NBtCaSBYvdAH0nOHbdH0dJPFMntzfSrItwSeF2sp2PJ7h8lRoDToHSUQLbfqc4rvATnBTUYFoMTSlcFx6pUv3Dg00oV7DmjjR');

var $form = $('#payment-form');

$form.submit(function (event) {
  $form.find('button').prop('disabled', true);
  $form.find('#payment-errors').addClass('d-none')

  Stripe.card.createToken({
    number: $('#card-number').val(),
    name: $('#name').val(),
    // email: $('#email').val(),
    cvc: $('#card-cvc').val(),
    exp_month: $('#card-expiry-month').val(),
    exp_year: $('#card-expiry-year').val(),
  }, stripeResponseHandler);

  return false;
});

function stripeResponseHandler(status, response) {

  // Grab the form:

  if (response.error) { // Problem!

    // Show the errors on the form
    $form.find('#payment-errors').text(response.error.message);
    $form.find('button').prop('disabled', false); // Re-enable submission
    $form.find('#payment-errors').removeClass('d-none');


  } else { // Token was created!

    // Get the token ID:
    var token = response.id;

    // Insert the token into the form so it gets submitted to the server:
    $form.append($('<input type="hidden" name="stripeToken" />').val(token));

    // Submit the form:
    $form.get(0).submit();

  }
}