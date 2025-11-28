// Diagnose Marketplace Issues
const { SuiClient } = require('@mysten/sui/client');

const RPC_URL = 'https://rpc-testnet.onelabs.cc:443';
const MARKETPLACE_ID = '0x175c044fe0e0fc401f45e5741e31f35445102c4171266424c3821720390703bd';
const PACKAGE_ID = '0xb87355127acb2b607280836182fc811bea17a3cd7601dba07035975878e696fa';

async function diagnose() {
  console.log('🔍 Diagnosing Marketplace...\n');

  const client = new SuiClient({ url: RPC_URL });

  try {
    // 1. Check marketplace object
    console.log('1️⃣ Checking Marketplace Object...');
    const marketplace = await client.getObject({
      id: MARKETPLACE_ID,
      options: {
        showContent: true,
        showType: true,
      },
    });

    console.log('Marketplace Status:', marketplace.data?.content?.dataType);
    console.log('Marketplace Type:', marketplace.data?.content?.type);
    
    if (marketplace.data?.content?.dataType === 'moveObject') {
      const fields = marketplace.data.content.fields;
      console.log('Marketplace Fields:', JSON.stringify(fields, null, 2));
      
      // Check listings table
      if (fields.listings) {
        console.log('\n📋 Listings Table ID:', fields.listings.fields.id.id);
        console.log('Listings Size:', fields.listings.fields.size);
      }
      
      // Check fee percentage
      if (fields.fee_percentage) {
        console.log('Fee Percentage:', fields.fee_percentage, '(', fields.fee_percentage / 100, '%)');
      }
    }

    // 2. Check dynamic fields (listings)
    console.log('\n2️⃣ Checking Dynamic Fields (Active Listings)...');
    try {
      const dynamicFields = await client.getDynamicFields({
        parentId: MARKETPLACE_ID,
      });

      console.log('Total Dynamic Fields:', dynamicFields.data.length);
      
      if (dynamicFields.data.length > 0) {
        console.log('\n📦 Active Listings:');
        for (const field of dynamicFields.data) {
          console.log('  - Field Name:', field.name);
          console.log('    Object ID:', field.objectId);
          console.log('    Type:', field.objectType);
          
          // Get field details
          try {
            const fieldObj = await client.getObject({
              id: field.objectId,
              options: { showContent: true },
            });
            
            if (fieldObj.data?.content?.dataType === 'moveObject') {
              console.log('    Content:', JSON.stringify(fieldObj.data.content.fields, null, 2));
            }
          } catch (err) {
            console.log('    Error fetching field details:', err.message);
          }
          console.log('');
        }
      } else {
        console.log('⚠️  No active listings found in marketplace');
      }
    } catch (err) {
      console.log('Error fetching dynamic fields:', err.message);
    }

    // 3. Check package
    console.log('\n3️⃣ Checking Package...');
    const pkg = await client.getObject({
      id: PACKAGE_ID,
      options: {
        showContent: true,
      },
    });
    console.log('Package Status:', pkg.data ? '✅ Found' : '❌ Not Found');

    console.log('\n✅ Diagnosis Complete!');
    console.log('\n💡 Tips:');
    console.log('  - Make sure there are active listings before trying to buy');
    console.log('  - Check that the NFT ID matches an active listing');
    console.log('  - Ensure you have enough OCT tokens');

  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
  }
}

diagnose();
