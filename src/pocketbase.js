import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pocketbase.0shura.fr');
pb.autoCancellation(false);
export default pb;