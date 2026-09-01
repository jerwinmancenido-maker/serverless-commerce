import { MedusaService } from "@medusajs/framework/utils"
import RewardAccount from "./models/reward-account"
import RewardLedgerEntry from "./models/reward-ledger-entry"
import RewardProgram from "./models/reward-program"
import RewardRedemption from "./models/reward-redemption"
import RewardRule from "./models/reward-rule"
import ReferralAccount from "./models/referral-account"
import ReferralEvent from "./models/referral-event"

class RewardsModuleService extends MedusaService({
  RewardAccount,
  RewardLedgerEntry,
  RewardProgram,
  RewardRedemption,
  RewardRule,
  ReferralAccount,
  ReferralEvent,
}) {}

export default RewardsModuleService
