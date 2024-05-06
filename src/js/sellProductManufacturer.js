App = {

    web3Provider: null,
    contracts: {},

    init: async function() {
        return await App.initWeb3();
    },

    initWeb3: function() {
        if(window.web3) {
            App.web3Provider=window.web3.currentProvider;
        } else {
            App.web3Provider=new Web3.providers.HttpProvider('http://localhost:7545');
        }

        web3 = new Web3(App.web3Provider);
        return App.initContract();
    },

    initContract: function() {

        $.getJSON('product.json',function(data){

            var productArtifact=data;
            App.contracts.product=TruffleContract(productArtifact);
            App.contracts.product.setProvider(App.web3Provider);
        });

        return App.bindEvents();
    },

    bindEvents: function() {

        $(document).on('click','.btn-register',App.registerProduct);
    },

    registerProduct: function(event) {
        event.preventDefault();

        var productInstance;

        var productSN = document.getElementById('productSN').value;
        var sellerCode = document.getElementById('sellerCode').value;
        var messageElement = document.getElementById('sellMessage');

    // Check if messageElement is defined
        if (!messageElement) {
            console.error("Error: 'sellMessage' element not found.");
            return;
        }
 
        //window.ethereum.enable();
        web3.eth.getAccounts(function(error,accounts){

            if(error) {
                console.log(error);
            }

            console.log(accounts);
            var account=accounts[0];
            // console.log(account);

            App.contracts.product.deployed().then(function(instance){
                productInstance=instance;
                return productInstance.manufacturerSellProduct(web3.fromAscii(productSN),web3.fromAscii(sellerCode), { from: account, gas: 3000000 });
             }).then(function(result){
                // Display success message
                messageElement.innerHTML = 'Product successfully sold to customer.';
                // Reload the page
                //window.location.reload();
                // Clear input fields or perform any other necessary actions
                document.getElementById('productSN').value = '';
                document.getElementById('sellerCode').value = '';
    
            }).catch(function(err){
                console.log(err.message);
                // Display error message if needed
                messageElement.innerHTML = 'Error: ' + err.message;
            });
        });
    }
};

$(function() {

    $(window).load(function() {
        App.init();
    })
})