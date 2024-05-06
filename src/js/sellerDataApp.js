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

        $(document).on('click','.btn-register',App.getData);
    },

    getData: function(event) {
        event.preventDefault();
        var manufacturerCode = document.getElementById('manufacturerId').value;
    
        var productInstance;
        //window.ethereum.enable();
        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
                return;
            }
    
            var account = accounts[0];
            // console.log(account);
    
            App.contracts.product.deployed().then(function(instance) {
                productInstance = instance;
                return productInstance.querySellersList(web3.fromAscii(manufacturerCode), { from: account, gas: 3000000 });
            }).then(function(result) {
                console.log("Query result:", result);
    
                if (!result || result.length < 7) {
                    console.error('Invalid or incomplete result object:', result);
                    return;
                }
    
                var sellerId = result[0] || [];
                var sellerName = (result[1] || []).map(name => web3.toAscii(name));
                var sellerBrand = (result[2] || []).map(brand => web3.toAscii(brand));
                var sellerCode = (result[3] || []).map(code => web3.toAscii(code));
                var sellerNum = result[4] || [];
                var sellerManager = (result[5] || []).map(manager => web3.toAscii(manager));
                var sellerAddress = (result[6] || []).map(address => web3.toAscii(address));
    
                console.log("Formatted seller data:");
                console.log("Seller IDs:", sellerId);
                console.log("Seller names:", sellerName);
                console.log("Seller brands:", sellerBrand);
                console.log("Seller codes:", sellerCode);
                console.log("Seller numbers:", sellerNum);
                console.log("Seller managers:", sellerManager);
                console.log("Seller addresses:", sellerAddress);
    
                var t = "";
                document.getElementById('logdata').innerHTML = t;
                for (var i = 0; i < sellerId.length; i++) {
                    var temptr = "<td>" + sellerNum[i] + "</td>";
                    if (temptr === "<td>0</td>") {
                        break;
                    }
                    var tr = "<tr>";
                    tr += "<td>" + sellerId[i] + "</td>";
                    tr += "<td>" + sellerName[i] + "</td>";
                    tr += "<td>" + sellerBrand[i] + "</td>";
                    tr += "<td>" + sellerCode[i] + "</td>";
                    tr += "<td>" + sellerNum[i] + "</td>";
                    tr += "<td>" + sellerManager[i] + "</td>";
                    tr += "<td>" + sellerAddress[i] + "</td>";
                    tr += "</tr>";
                    t += tr;
                }
                document.getElementById('logdata').innerHTML += t;
                document.getElementById('add').innerHTML = account;
            }).catch(function(err) {
                console.log(err.message);
            });
        });
    }
    
    
};

$(function() {
    $(window).load(function() {
        App.init();
    })
})