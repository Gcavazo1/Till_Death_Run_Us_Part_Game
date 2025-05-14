import { db } from '../firebase/FirebaseConfig';
import { collection, addDoc, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';

export interface LeaderboardEntry {
  id?: string;
  name: string;
  score: number;
  platform: string;
  timestamp: Date;
  level: number;
}

export class LeaderboardService {
  private readonly COLLECTION_NAME = 'leaderboard';
  
  async addScore(entry: Omit<LeaderboardEntry, 'id' | 'timestamp'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...entry,
        timestamp: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding score:", error);
      throw error;
    }
  }
  
  async getTopScores(count: number = 10, platform?: string): Promise<LeaderboardEntry[]> {
    try {
      let q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('score', 'desc'),
        limit(count)
      );
      
      if (platform) {
        q = query(q, where('platform', '==', platform));
      }
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<LeaderboardEntry, 'id'>,
        timestamp: (doc.data().timestamp as Timestamp).toDate() // Convert Firestore Timestamp to Date
      }));
    } catch (error) {
      console.error("Error getting top scores:", error);
      return [];
    }
  }
  
  async getPlayerRank(score: number, platform?: string): Promise<number> {
    try {
      let q = query(
        collection(db, this.COLLECTION_NAME),
        where('score', '>', score)
      );
      
      if (platform) {
        q = query(q, where('platform', '==', platform));
      }
      
      const querySnapshot = await getDocs(q);
      // Rank is the number of scores higher than this one, plus 1
      return querySnapshot.size + 1;
    } catch (error) {
      console.error("Error getting player rank:", error);
      return 0;
    }
  }
} 