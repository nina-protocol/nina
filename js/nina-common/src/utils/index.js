import idl from './idl'
import * as metaplex from './metaplex'
import NinaClient, { NINA_CLIENT_IDS } from './client'
import * as encrypt from './encrypt'
import * as web3 from './web3'


function debounce(func, wait, immediate) {
  var timeout;
  return function() {
  	var context = this, args = arguments;
  	clearTimeout(timeout);
  	timeout = setTimeout(function() {
  		timeout = null;
  		if (!immediate) func.apply(context, args);
  	}, wait);
  	if (immediate && !timeout) func.apply(context, args);
  };
}

export { idl, metaplex, NinaClient, NINA_CLIENT_IDS, encrypt, web3 , debounce}
