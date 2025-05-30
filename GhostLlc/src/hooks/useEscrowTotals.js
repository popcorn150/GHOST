import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../database/firebaseConfig";
import { useAuth } from "../components/AuthContext";

/**
 * Hook to compute the sum of `amount`, collect escrow IDs,
 * and build a list of withdrawal-request payloads for all
 * escrow docs matching a given sellerId and status.
 *
 * @param status - the escrow status to filter by
 * @returns {{
 *   totalAmount: number,
 *   withdrawalRequests: { escrowId: string, sellerId: string }[],
 *   loading: boolean
 * }}
 */
export function useEscrowTotal(status) {
  const { currentUser } = useAuth();
  const [totalAmount, setTotalAmount] = useState(0);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const sellerId = currentUser?.uid;

  useEffect(() => {
    if (!sellerId || !status) {
      setTotalAmount(0);
      setWithdrawalRequests([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const escrowsCol = collection(db, "escrows");
    const q = query(
      escrowsCol,
      where("sellerId", "==", sellerId),
      where("status", "==", status)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let sum = 0;
        const requests = snapshot.docs.map((doc) => {
          const data = doc.data();
          const amt =
            typeof data.amount === "number"
              ? data.amount
              : parseFloat(data.amount) || 0;
          sum += amt;
          return {
            escrowId: doc.id,
            sellerId,
          };
        });

        setTotalAmount(sum);
        setWithdrawalRequests(requests);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching escrows:", error);
        setTotalAmount(0);
        setWithdrawalRequests([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [sellerId, status]);

  return { totalAmount, withdrawalRequests, loading };
}
