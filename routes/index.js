var express = require('express');
var router = express.Router();
var Product = require('../models/product');
var User = require('../models/user');
var Order = require('../models/order');
var passport = require('passport');
var Cart = require('../models/cart');
const order = require('../models/order');




/* GET home page. */
router.get('/', function (req, res, next) {
  var successmsg = req.flash('success')[0];

  Product.find(function (err, docs) {
    for (i = 0; i < docs.length; i += 100) {
      var productchunks = [];
      productchunks.push(docs.slice(i, i += 100));
    }
    res.render('shop/index', { title: 'Express', products: productchunks, successmsg: successmsg, nomsg: !successmsg });
  }).lean();
});


// ******************************************************************************************



router.get('/addtocart/:id', function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findById(productId, function (err, product) {
    if (err) {
      return res.redirect('/');
    }
    cart.add(product, product.id);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect('/');
  });

});

router.get('/addbyone/:id', function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart);
  cart.addbyone(productId);
  req.session.cart = cart;
  res.redirect('/shop-cart');
});

router.get('/reducedbyone/:id', function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart);
  cart.reducebyone(productId);
  req.session.cart = cart;
  res.redirect('/shop-cart');
});


router.get('/deleteallitem/:id', function (req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart);
  cart.deleteallitem(productId);
  req.session.cart = cart;
  res.redirect('/shop-cart');
})

// **********************************************************************

router.get('/shop-cart', function (req, res, next) {
  if (!req.session.cart) {
    return res.render('shop/shop-cart', { products: null });
  }

  var cart = new Cart(req.session.cart);
  res.render('shop/shop-cart', {
    products: cart.generateArray(),
    cart: cart, totalPrice: cart.totalPrice, totalQty: cart.totalQty
  });

});

router.get('/shop/help', function (req, res, next) {
  res.render('shop/help');
});

router.get('/shop/more', function (req, res, next) {
  res.render('shop/more');
})


// checkout page
router.get('/shop/checkout', loginfirst, function (req, res, next) {
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  if (!req.session.cart) {
    return res.redirect('/shop-cart');
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/checkout', { totalPrice: cart.totalPrice, totalQty: cart.totalQty });
});


router.post('/checkout', function (req, res, next) {

  // Set your secret key. Remember to switch to your live secret key in production.
  // See your keys here: https://dashboard.stripe.com/apikeys

  var stripe = require('stripe')('sk_test_51NBtCaSBYvdAH0nO4pPEr6SrNIRGVb7TCtcIsJmwSTMwf8TFLKpylfVDEya4Wc67IEKVeNDq3Z0Ts3qMnjQvmHJL00vGmKegG7');
  var cart = new Cart(req.session.cart);

  stripe.customers.create({
    source: req.body.stripeToken
  });

  stripe.paymentIntents.create({
    amount: cart.totalPrice * 100,
    currency: 'inr',
    description: 'test-payment',
  }, function (err, charge) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/checkout');
    }

    var orders = new Order({
      user: req.user,
      cart: cart,
      name: req.body.name,
      email: req.body.email,
      mobile: req.body.mobile,
      paymentId: charge.id,
      time: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')     // delete the dot and everything after

    });
    orders.save(function (err, result) {
      if (err) {
        return err;
      }

      req.flash('success', 'your order is placed');
      req.session.cart = null;
      res.redirect('/');

    });
  });
});




// profile page
router.get('/user/profile', isloggedin, function (req, res, next) {
  Order.find({ user: req.user }, function (err, orders) {
    if (err) {
      return res.write('error');
    }
    orders.forEach(function (order) {
      var cart = new Cart(order.cart);
      order.items = cart.items;
    })
    res.render('user/profile', { orders: orders, email: req.user.email });


  })
});


router.get('/logout', function (req, res, next) {
  req.logout((err) => {
    if (err) {
      console.console.log("not logout");
    }
    else {
      console.log("logout successfully");
    }
  });
  res.redirect('/');
})




// signup page 
router.get('/user/signup', function (req, res, next) {
  var errormsg = req.flash('error');
  res.render('user/signup', { errormsg: errormsg, haserror: errormsg.length > 0 });
});

router.post('/user/signup', passport.authenticate('local-signup', {
  // successRedirect: '/user/profile',
  failureRedirect: '/user/signup',
  failureFlash: true,
  keepSessionInfo: true

}), function (req, res, next) {
  if (req.session.oldUrl) {
    var oldUrl = req.session.oldUrl;
    req.session.oldUrl = null;
    return res.redirect(oldUrl);
  }
  else {
    return res.redirect('/user/profile');
  }
}
);

// ***************************************************************************


router.get('/user/login', function (req, res, next) {
  var errormsg = req.flash('error');
  res.render('user/login', { errormsg: errormsg, haserror: errormsg.length > 0 });
});


router.post('/user/login', passport.authenticate('local-login', {
  // successRedirect: '/user/profile',

  failureRedirect: '/user/login',
  failureFlash: true,
  keepSessionInfo: true
})
  , function (req, res, next) {
    if (req.session.oldUrl) {
      var oldUrl = req.session.oldUrl;
      req.session.oldUrl = null;
      return res.redirect(oldUrl);
    }
    else {
      return res.redirect('/user/profile');
    }
  });








module.exports = router;

function isloggedin(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}




function loginfirst(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/login');
}