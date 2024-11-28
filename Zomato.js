let isOrderAccepted = false;
let isValetFound = false;
let hasRestaurantSeenYourOrder = false;
let restaurantTimer = null;                                   //bydefault false hi hoga restaurant nhi dekha hai order
let valetTimer = null;
let valetDeliveryTimer = null;
let isOrderDelivered = false;

// Zomato App - Boot up/ Power Up/ Start
window.addEventListener('load', function(){
    document.getElementById('acceptOrder').addEventListener('click', function(){                                  // isme click event listener lagate hain ki accept karana hai ya nhi karana
         askRestaurantToAcceptOrReject();
    });     
    
    document.getElementById('findValet').addEventListener('click', function(){                                      // isko button ke according chalaynge, restaurant control bhi zomato ke paas rhega aur valet find krne ka control bhi zomato ke paas rhega, to hum isko apne logic me nhi rakhenge ye zomato khud dekhega
        startSearchingForValets();
    })

    document.getElementById('deliverOrder').addEventListener('click', function(){
        setTimeout(() => {
            isOrderDelivered = true;      
        },2000); 
        
    })

    
    checkIfOrderAcceptedFromRestaurant()                                                                          //pehle click krne ke baad hi check ho rha tha but actual me aisa nhi hota restaurant alag chalega to jab page load hoga (after }); above) uspe hi function laga diya hai jaise hi page load hua tabhi check kr lega ki accept hua ya nhi 
         .then(isOrderAccepted=>{
            console.log('updated from restaurant . ', isOrderAccepted);
            // Step 4 - Start preparing
            if(isOrderAccepted) startPreparingOrder();
            // Step 3 - Order Rejected
            else alert('Sorry restaurant couldnt accept your order! Returning your amount with zomato shares');
         })
         .catch(err=>{                                                                      //catch mtlb kuch error aaya ya code fat gya                                                                  
            console.error(err);
            alert('Something went wrong! Please try again later');
         })
})


//Step 1 - Check whether restaurant accepted order or not
function askRestaurantToAcceptOrReject(){
    // callback                                                                               // setTimeout ek callback leta hai aur ek timer leta hai (1000 in this case), ki itne time baad vo callback execute kr lega, callback ek function hai jo thodi der baad execute krvana chahte ho ya kisi meaningful function me execute karana chahte ho   
    setTimeout(() => {
       isOrderAccepted = confirm('Should restaurant accept order?');                                      //confirm ek prompt hota hai jo true or false me poochega humse
       hasRestaurantSeenYourOrder = true;
    //  console.log(isOrderAccepted);    - yaha pe print kr rhe the true false vo hata de rhe hain kyuki hume pta hi hai kya select kr rhe hain true/false to print kyu karana
    }, 1000);                                                                           //1sec ka delay daal dete hain, ki 1 sec baad humse poocho ki restaurant se accept karana hai ya reject karana hai
    // jab bhi ye function (askRestaurantToAcceptOrReject) call hoga to setTimeout trigger hoga aur ye callback call krega 1 sec baad
    
}    


//Step 2 - Check if restaurant has accepted order
function checkIfOrderAcceptedFromRestaurant(){
        // promise already defined entity hai jiske aage new lagake uska new instance create kr skte ho jiski memory heap me assign hoti hai      
        // var promise variable define nhi kr rha mai direct new promise bana ke return kr rha hu 
        return new Promise((resolve, reject) => {                                                                              //har kuch hard coded chal rha hai ho skta hai vo 5sec,10sec,1 min le to mai settimeout baar baar nhi lagaunga, instead mjhe promise kr do ki mai check kr rha hu baar baar jaise hi update aata hai mai bta dunga            
            restaurantTimer = setInterval(() => {                                                                              //ye har 2 sec me check krta rhega ki restaurant ne accept kra ya nhi 
                console.log('checking if order accepted or not');
                if(!hasRestaurantSeenYourOrder) return;                                                 //agar restaurant ne aapka order dekha hi nhi hai to reject kr do
                
                if(isOrderAccepted) resolve(true);
                else resolve(false);

                clearInterval(restaurantTimer);                                                      //timer clear krne ka mtlb uske time ko note kr lo (restaurantTimer) aur usko call kra do to timer clear ho jayga baar baar execute nhi hoga
        }, 2000);                                                                                                 //isme timeinterval me aisa counter laga skte hain ki itni der tak chal gya to order reject ho jayga example- 1 min ya koi bhi time ka timeinterval laga skte hain jaise 5 sec ke according 12 baar counter chal gya (1 min) to order reject
    });                                                                        // not doing it now but aise kr skte hain ki 5 sec baad ya to restaurant order accept krega ya reject
}    

// callback me fix hota hai ki ek baar chal gya to khtm, promise me aisa hota hai ki mai ticket de rha hu 5min, 10 min chalo jo marzi kro but final ho jaay mujhe bta dena

//Step 4 - start preparing
function startPreparingOrder(){
    Promise.allSettled([
        updateOrderStatus(),
        updateMapView(),
        checkIfValetAssigned(),
        checkIfOrderDelivered()
    ])
    .then(res=>{
        console.log(res);
        setTimeout(()=>{
            alert('How was your food? Rate your food and delivery partner');
        },5000);
    })
        .catch(err=>{
            console.error(err);
        })

}


// Helper functions - Pure functions (ek kaam ke liye bane hai - like button ka kaam hota hai light off krna ya on krna)
function updateOrderStatus(){
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            document.getElementById('currentStatus').innerText = isOrderDelivered ? 'Order Delivered successfully' : 'Preparing your order';
            resolve('status updated');
        },1500);
    })
    
}

function updateMapView(){
    // fake delay to get data
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            document.getElementById('mapview').style.opacity = '1';        
            resolve('map initialised');
        },1000);
    });    
                                                 //opacity kam ki hui thi to usko 100% kr denge (1)
}

function startSearchingForValets(){                                                                // but order jab krte ho pehle food preparation, map update ho jata hai, order status update ho jata hai uske 10 min baad 
    //                                                                                                // valet search start hota hai bcoz food banne ke pehle hi valet wait krta rhega instead vo koi aur order deliver kr lega uske baad idhar assign hoga
    //                                                                                                //BED
    // bhut complex operations:-
    /**
     * 1. Get all locations of nearby valets
     * 2. Sort the valets based on shortest path of restaurant
     * + to customer home
     * 3. Select the valet with shortest distance and minimum orders
     */

    // Step 1 = get valets nearby
    const valetsPromises = [];
    for(let i=0;i<5;i++){
         valetsPromises.push(getRandomDriver());  
    }
    console.log(valetsPromises);

    Promise.race(valetsPromises)
    .then(selectedValet => {
        console.log('Selected a valet => ' ,selectedValet);
        isValetFound = true;
    })
    .catch(err=>{
        console.error(err);
    })
}

function getRandomDriver(){
    //Fake delay to location data from riders
    return new Promise((resolve,reject)=>{
        const timeout = Math.random()*1000;
        setTimeout(()=>{
             resolve('valet - '+timeout);
        }, timeout);
    });
}

function checkIfValetAssigned(){
    return new Promise((resolve, reject)=>{
         valetTimer = setInterval(() => {
            console.log(' searching for valet');
            if (isValetFound) {
                updateValetDetails();
                resolve('update valet details');
                clearTimeout(valetTimer);
            } 
         },1000);
    })
}

function checkIfOrderDelivered(){
    return new Promise((resolve, reject)=>{
        valetDeliveryTimer = setInterval(() => {
           console.log(' is order delivered by valet');
           if (isOrderDelivered) {
               resolve('order delivered valet details');
               updateOrderStatus();
               clearTimeout(valetTimer);
           } 
        },1000);
   })
}

function updateValetDetails(){
    if(isValetFound){
        document.getElementById('finding-driver').classList.add('none');
        
        document.getElementById('found-driver').classList.remove('none');
        document.getElementById('call').classList.remove('none');
    }
}


//Promise - then, catch          callback - resolve, reject
// Types of promise -
// 1. Promise.all - saare operations call krta hai parallaley, if one fails, promise.all fails aur catch block call ho jayga
// 2. Promise.allsettled - saare operations call krta hai parallaley, if one fails, uska response fail vala ho jayga but baaki jo fullfill hue hain unka response fullfill vala hi rhega, don't give a damn, promise.allsettled passes, 
// 3. Promise.race - first promise to settled - whether it is resolved or rejected
// 4. Promise.any - first promise to fullfill that is resolved/fullfilled