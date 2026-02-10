/**
 * Notification-Like Service - 新着バッジ機能（プッシュ通知ではない）
 * 「相手が更新して、自分がまだ見ていない」を判定
 */

import { PartnerReads } from './readService'

export interface UpdatedAtByDomain {
  state?: Date
  logs?: Date
  rules?: Date
  future?: Date
}

export interface NewBadges {
  stateNew: boolean
  logsNew: boolean
  rulesNew: boolean
  futureNew: boolean
}

/**
 * 新着バッジの計算
 * @param partnerUpdatedAtByDomain - 各domainの相手の最新更新日時
 * @param myLastSeenByDomain - 各domainの自分の最終閲覧日時
 */
export function computeNewBadges(
  partnerUpdatedAtByDomain: UpdatedAtByDomain,
  myLastSeenByDomain: PartnerReads
): NewBadges {
  return {
    stateNew: isNew(partnerUpdatedAtByDomain.state, myLastSeenByDomain.state),
    logsNew: isNew(partnerUpdatedAtByDomain.logs, myLastSeenByDomain.logs),
    rulesNew: isNew(partnerUpdatedAtByDomain.rules, myLastSeenByDomain.rules),
    futureNew: isNew(partnerUpdatedAtByDomain.future, myLastSeenByDomain.future),
  }
}

/**
 * 新着判定: 相手の更新日時 > 自分の閲覧日時
 */
function isNew(partnerUpdatedAt: Date | undefined, myLastSeen: Date | undefined): boolean {
  if (!partnerUpdatedAt) return false
  if (!myLastSeen) return true // 一度も見ていない場合は新着

  return partnerUpdatedAt.getTime() > myLastSeen.getTime()
}
