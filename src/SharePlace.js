import { Modal } from './UI/Modal';
import { Map } from './UI/Map';
import { getCoordsFromAddress, getAddressFromCoords } from './Utility/Location';

class PlaceFinder{
constructor(){
    const addressForm=document.querySelector('form');
    const locateUserBtn=document.getElementById('locate-btn');
    this.shareBtn=document.getElementById('share-btn');

    addressForm.addEventListener('submit',this.findAddressHandler.bind(this));
    this.shareBtn.addEventListener('click',this.sharePlaceHandler);
    locateUserBtn.addEventListener('click',this.locateUserHandler.bind(this));
}
sharePlaceHandler(){
    const sharedLinkInputElement=document.getElementById('share-link');
    if(!navigator.clipboard){
        sharedLinkInputElement.select();
        return;
    }
    navigator.clipboard.writeText(sharedLinkInputElement.value).then(()=>{
        alert('copied into clipboard');
    })
    .catch(err=>{
        console.log(err);
        sharedLinkInputElement.select();
    });
}
selectPlace(coordinates,address){
    if(this.map){
        this.map.render();
    }else{
       this.map= new Map(coordinates);
    }
    fetch('http://localhost:3000/add-location', {
      method: 'POST',
      body: JSON.stringify({
        address: address,
        lat: coordinates.lat,
        lng: coordinates.lng
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
          const locationid=data.locid;
        this.shareBtn.disabled=false;
        const sharedLinkInputElement=document.getElementById('share-link');
        sharedLinkInputElement.value=`${location.origin}/my-place?location=${locationid}`;
        
      });
   

}

locateUserHandler(){
    if(!navigator.geolocation){
        alert('feature is not supported use modern browser or enter manually');
        return;
    }
    const modal= new Modal('loading-modal-content','loading location-please wait');
    modal.show();
    navigator.geolocation.getCurrentPosition(
        async successResult=>{
        
        const coordinates={
            lat:successResult.coords.latitude+ Math.random()*50 ,
            lng:successResult.coords.longitude + Math.random()*50
        };

        const address=await getAddressFromCoords(coordinates);
        modal.hide();
        this.selectPlace(coordinates,address);
        //console.log(coordinates);
    },error=>{
        modal.hide();
        alert('unfortunately couldnot load your location');
    });
}

async findAddressHandler(event){
    event.preventDefault();
    const address=event.target.querySelector('input').value;
    if(!address || address.trim()===0){
        alert("invalid address entered-please try again");
        return;
    }
    const modal= new Modal('loading-modal-content','loading location-please wait');
    modal.show();
    try{
    const coordinates= await getCoordsFromAddress(address);
    this.selectPlace(coordinates,address);
    }catch(err){
alert(err.message);
    }
    modal.hide();

}

}

const placeFinder=new PlaceFinder();