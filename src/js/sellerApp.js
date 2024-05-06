App = {

    web3Provider: null,
    contracts: {},

    init: async function() {
        return await App.initWeb3();
    },

    initWeb3: function() {
        if(window.web3) {
            App.web3Provider = window.web3.currentProvider;
        } else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }

        web3 = new Web3(App.web3Provider);
        return App.initContract();
    },

    initContract: function() {

        $.getJSON('product.json', function(data) {

            var productArtifact = data;
            App.contracts.product = TruffleContract(productArtifact);
            App.contracts.product.setProvider(App.web3Provider);
        });

        return App.bindEvents();
    },

    bindEvents: function() {

        $(document).on('click', '.btn-register', App.registerProduct);
    },

    registerProduct: function(event) {
        event.preventDefault();

        var productInstance;

        var sellerName = document.getElementById('SellerName').value;
        var sellerBrand = document.getElementById('SellerBrand').value;
        var sellerCode = document.getElementById('SellerCode').value;
        var sellerPhoneNumber = document.getElementById('SellerPhoneNumber').value;
        var sellerManager = document.getElementById('SellerManager').value;
        var sellerAddress = document.getElementById('SellerAddress').value;
        var ManufacturerId = document.getElementById('ManufacturerId').value;

        web3.eth.getAccounts(function(error, accounts) {

            if (error) {
                console.log(error);
            }

            var account = accounts[0];

            App.contracts.product.deployed().then(function(instance) {
                productInstance = instance;
                return productInstance.addSeller(
                    web3.fromAscii(ManufacturerId),
                    web3.fromAscii(sellerName),
                    web3.fromAscii(sellerBrand),
                    web3.fromAscii(sellerCode),
                    sellerPhoneNumber,
                    web3.fromAscii(sellerManager),
                    web3.fromAscii(sellerAddress), 
                    { from: account, gas: 3000000 }
                );
             }).then(function(result) {
                console.log("Transaction result:", result);
                document.getElementById('sellerMessage').innerHTML = 'Seller added successfully.';
                document.getElementById('sellerMessage').style.display = 'block';
            }).catch(function(err) {
                console.error(err.message);
            });
        });
    },

};

$(function() {

    $(window).load(function() {
        App.init();
    })
})
