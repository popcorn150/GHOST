// src/services/withdrawal.service.ts
import axios from "axios";

/**
 * Service for wrapping the withdrawal-related HTTP endpoints:
 *  - setting a user’s bank details
 *  - processing a seller withdrawal
 */
export class WithdrawalService {
  constructor(baseApiUrl = import.meta.env.VITE_API_URL || "/api") {
    // endpoint for setting bank details
    this.bankDetailsUrl = `${baseApiUrl}/users/bank-details`;
    // endpoint for withdrawal
    this.withdrawUrl = `${baseApiUrl}/escrows/withdraw`;
  }

  /**
   * Persist bank details for the authenticated user
   * @param request the bank details payload
   * @returns the API’s JSON response
   */
  async setBankDetails(request) {
    try {
      const resp = await axios.post(this.bankDetailsUrl, request);
      return resp.data;
    } catch (err) {
      console.error(
        "Failed to set bank details:",
        err.response?.data || err.message
      );
      throw err;
    }
  }

  /**
   * Initiate and process a withdrawal for a seller
   * @param request contains escrowId and userId
   * @returns the API’s JSON response
   */
  async processWithdrawal(request) {
    try {
      const resp = await axios.post(this.withdrawUrl, request);
      return resp.data;
    } catch (err) {
      console.error(
        "Failed to process withdrawal:",
        err.response?.data || err.message
      );
      throw err;
    }
  }
}

// singleton export
const withdrawalService = new WithdrawalService();
export default withdrawalService;
