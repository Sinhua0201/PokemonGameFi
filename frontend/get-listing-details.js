// Get Listing Details
const { SuiClient } = require('@mysten/sui/client');

const RPC_URL = 'https://rpc-testnet.onelabs.cc:443';
const MARKETPLACE_ID = '0x175c044fe0e0fc401f45e5741e31f35445102c4171266424c3821720390703bd';
const LISTING_OBJECT_ID = '0xdb130479e97cbb3ebaf2fd2ef3105be4526afac03d259a72ff4d9a5b448859c1';
const NFT_ID = '0x4dedd2e170e11782fa9eb176299978997f4cf7f25c201a017c0ed77abf49ee5c';

async function getListingDetails() {
  console.log('🔍 Getting Listing Details...\n');

  const client = new SuiClient({ url: RPC_URL });

  try {
    // Get the listing object (EggListing wrapper)
    console.log('1️⃣ Fetching EggListing object...');
    const listingObj = await client.getObject({
      id: LISTING_OBJECT_ID,
      options: {
        showContent: true,
        showType: true,
        showOwner: true,
      },
    });

    console.log('Listing Object:', JSON.stringify(listingObj.data, null, 2));

    // Get the listings table to find price
    console.log('\n2️⃣ Fetching listings table...');
    const tableId = '0x6074482cf2186cf43a92c9e3f2f4b017996fbf0fc2f521168415834270cc25f8';
    
    // Try to get dynamic field from table
    const dynamicField = await client.getDynamicFieldObject({
      parentId: tableId,
      name: {
        type: '0x2::object::ID',
        value: NFT_ID,
      },
    });

    console.log('Listing Info from Table:', JSON.stringify(dynamicField.data, null, 2));

    if (dynamicField.data?.content?.dataType === 'moveObject') {
      const fields = dynamicField.data.content.fields;
      console.log('\n📋 Listing Details:');
      console.log('  NFT Type:', fields.nft_type === '2' ? 'Egg' : 'Pokemon');
      console.log('  Seller:', fields.seller);
      console.log('  Price (MIST):', fields.price);
      console.log('  Price (OCT):', parseInt(fields.price) / 1_000_000_000);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getListingDetails();
