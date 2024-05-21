import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pocketbase.0shura.fr');
pb.autoCancel = false;
export default pb;