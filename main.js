Vue.use(Toasted);
window.stop();

var tableNumber = getQuerystring('tableNumber', 'default');
function getQuerystring(key, default_) 
{ 
    if (default_==null) 
    { 
        default_=""; 
    } 
    var search = unescape(location.search); 
    if (search == "") 
    { 
        return default_; 
    } 
    search = search.substr(1); 
    var params = search.split("&"); 
    for (var i = 0; i < params.length; i++) 
    { 
        var pairs = params[i].split("="); 
        if(pairs[0] == key) 
        { 
            return pairs[1]; 
        } 
    } 


return default_; 
}

const VueToast = window.vueToasts ? window.vueToasts.default || window.vueToasts : window.vueToasts;
var app = new Vue({
        el: '#app',
        data: {
            showRemark: false,
            useOldDelivery: false,
            active_el2: 'tm',
            active_el: 'tp',
            orderNumber: '',
            selected: 'first',
            options: [
            ],
            isOutShow: false,
            showModal: false,
            showCat: false,
            dummy: '',
            isOut: false,
            dismissCountDown: 10,
            dismissSecs: 200,
            showPayQR: 0,
            showAlert: false,
            showCart: false,
            order: {
            	diceCount: 0,
                remark: '',
                merchatId: 'qmm1969@163.com',
                delivery: {},
                tableNumber: tableNumber,
                items: {
                }
            }
            ,
            tableNumber: tableNumber,
            receiveClass: false,
            isActive: false,
            secondCats: {},
            showSecondCats: false,
            all: myall,
            items: defaultk,
        }
        ,
        mounted: () => {
                $('.items').flyto({
                        item: '.product',
                        target: '.cart',
                        button: '.add'
                    }
                );
            }
            ,
        methods: {
            gotoPay: function() {
                if (this.isEmptyObject(this.order.items)) {
                    alert("你的购物车为空!");
                    return;
                }
                if (this.order.isOut) {
                    if (this.order.delivery.mobile && this.order.delivery.address) {
                        this.$cookies.set('mobile', this.order.delivery.mobile, {
                            expires: 7
                        });
                        this.$cookies.set('address', this.order.delivery.address, {
                            expires: 7
                        });
                    } else {
                        alert("请填完整的外卖送货信息!");
                        this.isOutShow = true;
                        return;
                    }
                } else {
                    if (this.order.tableNumber.length == 0) {
                        alert("请选择你所在的台号!");
                        return;
                    }
                }
                this.showPayQR = !this.showPayQR;
                if(this.showPayQR){
                	 this.items = [];
                }else{
                	this.goCat('default');
                }
               
            },
            checkNeedShow: function() {
                this.order.tableNumber = null;
                var mymobile = this.$cookies.get('mobile');
                var myaddress = this.$cookies.get('address');
                if (mymobile && myaddress) {
                    this.order.delivery.mobile = mymobile;
                    this.order.delivery.address = myaddress;
                    this.useOldDelivery = true;
                } else {
                    this.isOutShow = true;
                    this.showCart = false;
                }
            },
            formatPrice(value) {
                let val = (value / 1).toFixed(2).replace('.', ',')
                return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
            }
            ,
            onTap: function(obj) {
                    this.$toasted.info('+1', {
                        duration: 500,
                        theme: 'bubble',
                        position: 'bottom-right',
                        className: 'mytoast'
                    });
                    var item = obj
                    var me = item.sku
                    var self = this;
                    var od = self.order;
                    var items = od.items;
                    if (items && items[me]) {
                        items[me]['qty'] = items[me]['qty'] + 1;
                    } else {
                        this.$set(items, me, item);
                        this.$set(items[me], 'qty', 1);
                    }
                }
                ,
            decrease: function(obj) {
                var item = obj
                var me = item.sku
                var self = this;
                var od = self.order;
                var items = od.items;
                if (items && items[me]) {
                    var newValue = items[me]['qty'] - 1;
                    if (newValue >= 0) {
                        items[me]['qty'] = newValue;
                        this.$toasted.error('-1', {
                            duration: 500,
                            theme: 'bubble',
                            position: 'bottom-right',
                            className: 'mytoast2'
                        });
                    }
                }
            },
            remove: function(me) {
                    var self = this;
                    var od = self.order;
                    var items = od.items;
                    if (items && items[me]) {
                        delete items[me];
                        this.dummy = new Date();
                    }
                }
                ,
            isEmptyObject: function(obj) {
                for (var prop in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                        return false;
                    }
                }
                return true;
            },
            inputQty: function(obj) {
                    var item = obj
                    var me = item.sku
                    var self = this;
                    var od = self.order;
                    var items = od.items;
                    items[me]['qty'] = parseInt(item.qty);
                }
                ,
            hasProblem: function(){
            	 this.showPayQR = false;
            	 this.goCat('default');
            },
            
            submit: function() {
                    this.receiveClass = true;
                    var me = this;
                    this.order['total'] = this.sumByKey(this.items);
                    $.ajax({
                        type: 'POST',
                        url: 'http://yeech.pe.hu/RealState/index.php/api/submit',
                        data: {
                            'order': this.order
                        }
                        ,
                        dataType: 'json',
                        success: function(responseData, textStatus, jqXHR) {
                            
                            me.$toasted.success('提交成功!', {
                                duration: 4000,
                                position: 'bottom-right'
                            });
                            me.receiveClass = false;
                            me.showPayQR = true;
                            me.showCart = 0;
                            me.orderNumber = responseData.orderNumber;
                            me.showPayQR = false;
                            me.$cookies.set('orderNumber', me.orderNumber, {
                                expires: 7
                            });
                            //me.items = [];
                           
                            me.showMyCart();
                            //me.goCat('default');
                            //$("#mask").hide();
                            
                            var itemsStr = me.$cookies.get('items');
                            var itemsObj = JSON.parse(itemsStr) || [];
                            
                            var newItemsObj = itemsObj.concat(me.order.items);
                            me.$cookies.set('items', JSON.stringify(newItemsObj), {
                                expires: 2
                            });
                        },
                        error: function(responseData, textStatus, jqXHR) {
                          
                            me.$toasted.success('提交成功!', {
                                duration: 4000,
                                position: 'bottom-right'
                            });
                            me.receiveClass = false;
                            me.showCart = 0;
                            me.showPayQR = false;
                            //me.items = [];
                           
                            me.showMyCart();  
                            
                            var itemsStr = me.$cookies.get('items');
                            var itemsObj = JSON.parse(itemsStr) || [];
                            var newItemsObj = itemsObj.concat(me.order.items);
                            me.$cookies.set('items', JSON.stringify(newItemsObj), {
                                expires: 2
                            });
                            //me.goCat('default');
                            //$("#mask").hide();
                        }
                    });
                }
                ,
            changeClass: function() {
                }
                ,
            showMyCart: function() {
            	$("#mask").toggle();
            	this.showCart = !this.showCart;
            },
            chnageCat: function(catCode, showAll) {
                this.secondCats = this.all[catCode];
                this.showSecondCats = !this.showSecondCats;
                this.active_el = catCode;
                if (showAll) {
                    var par = this.all[catCode];
                    var items = [];
                    for (k in par) {
                        console.log(par[k]);
                        items = items.concat(par[k]);
                    }
                    this.items = items;
                    console.log(this.items);
                }
            },
            goCat: function(parent, catCode) {
            	
                    this.active_el = parent;
                    this.active_el2 = parent + catCode;
                    setTimeout(function() {
                        $('.items').flyto({
                                item: '.product',
                                target: '.cart',
                                button: '.add'
                            }
                        );
                    }, 1000);
                    if (catCode) {
                        this.items = this.all[parent][catCode];
                    } else {
                        this.items = this.all[parent];
                    }
                    
                    $('#mask').show();
                	this.showCart=false;
                	//this.showCat=false;
                }
                ,
            countDownChanged(dismissCountDown) {
                this.dismissCountDown = dismissCountDown
            }
            ,
            toUrl: function(key) {
                if (key == "") {
                    return null;
                }
                return merchantCode + "/" + key + ".jpg";
            },
            sumByKey: function(object) {
                    var sum = 0;
                    for (k in object) {
                        var item = object[k];
                        sum += item['qty'] * item['price'];
                    }
                    return sum;
                }
                ,
            sumByKeyOnly: function(object, key) {
                var sum = 0;
                for (k in object) {
                    var item = object[k];
                    sum += item[key];
                }
                return sum;
            }
        }
        ,
        components: {
            'v-select': VueSelect.VueSelect,
        }
    }
)
Vue.component('modal', {
    template: '#modal-template'
})