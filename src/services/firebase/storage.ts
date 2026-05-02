import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

export async function uploadPhoto(
  userId: string,
  listingId: string,
  photoIndex: number,
  uri: string
): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const path = `listings/${userId}/${listingId}/photos/${photoIndex}.jpg`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
}

export async function deletePhoto(
  userId: string,
  listingId: string,
  photoIndex: number
): Promise<void> {
  const path = `listings/${userId}/${listingId}/photos/${photoIndex}.jpg`;
  await deleteObject(ref(storage, path));
}
