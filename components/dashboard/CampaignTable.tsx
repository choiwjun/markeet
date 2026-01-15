'use client';

import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils/format';

export interface CampaignData {
  campaign_id: string;
  campaign_name: string;
  spend: number;
  revenue: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roas: number;
  ctr: number;
  cvr: number;
}

interface CampaignTableProps {
  campaigns: CampaignData[];
  className?: string;
}

type SortKey = keyof CampaignData;
type SortDirection = 'asc' | 'desc';

// 스타일 상수
const TABLE_CONTAINER_STYLES = [
  'bg-white dark:bg-slate-800',
  'rounded-xl',
  'border border-slate-200 dark:border-slate-700',
  'overflow-hidden',
].join(' ');

const TABLE_STYLES = 'w-full';

const HEADER_ROW_STYLES = 'bg-slate-50 dark:bg-slate-900/50';

const HEADER_CELL_STYLES = [
  'px-4 py-3',
  'text-left text-xs font-semibold uppercase tracking-wider',
  'text-slate-500 dark:text-slate-400',
  'cursor-pointer select-none',
  'hover:bg-slate-100 dark:hover:bg-slate-800',
  'transition-colors',
].join(' ');

const HEADER_CELL_RIGHT_STYLES = 'text-right';

const BODY_ROW_STYLES = [
  'border-t border-slate-100 dark:border-slate-700/50',
  'hover:bg-slate-50 dark:hover:bg-slate-800/50',
  'transition-colors',
].join(' ');

const CELL_STYLES = 'px-4 py-3 text-sm';

const CELL_NAME_STYLES = 'font-medium text-slate-900 dark:text-white';

const CELL_VALUE_STYLES = 'text-right text-slate-600 dark:text-slate-300 font-mono';

const SORT_ICON_STYLES = 'inline-block ml-1 w-3 h-3';

const ROAS_BADGE_STYLES = {
  high: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  low: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

/**
 * 캠페인 목록 테이블
 * TASK-1203: 캠페인별 성과 데이터 테이블
 */
export function CampaignTable({ campaigns, className }: CampaignTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('spend');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // 정렬된 데이터
  const sortedCampaigns = useMemo(() => {
    return [...campaigns].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue);
      const bStr = String(bValue);
      return sortDirection === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [campaigns, sortKey, sortDirection]);

  // 정렬 핸들러
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  // 정렬 아이콘
  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className={SORT_ICON_STYLES + ' opacity-30'} />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className={SORT_ICON_STYLES} />
    ) : (
      <ArrowDown className={SORT_ICON_STYLES} />
    );
  };

  // ROAS 뱃지 스타일
  const getRoasBadgeStyle = (roas: number) => {
    if (roas >= 3) return ROAS_BADGE_STYLES.high;
    if (roas >= 1) return ROAS_BADGE_STYLES.medium;
    return ROAS_BADGE_STYLES.low;
  };

  if (campaigns.length === 0) {
    return (
      <div className={`${TABLE_CONTAINER_STYLES} p-8 text-center ${className || ''}`}>
        <p className="text-slate-500 dark:text-slate-400">캠페인 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={`${TABLE_CONTAINER_STYLES} overflow-x-auto ${className || ''}`}>
      <table className={TABLE_STYLES}>
        <thead>
          <tr className={HEADER_ROW_STYLES}>
            <th
              className={HEADER_CELL_STYLES}
              onClick={() => handleSort('campaign_name')}
            >
              캠페인명
              <SortIcon columnKey="campaign_name" />
            </th>
            <th
              className={`${HEADER_CELL_STYLES} ${HEADER_CELL_RIGHT_STYLES}`}
              onClick={() => handleSort('spend')}
            >
              광고비
              <SortIcon columnKey="spend" />
            </th>
            <th
              className={`${HEADER_CELL_STYLES} ${HEADER_CELL_RIGHT_STYLES}`}
              onClick={() => handleSort('revenue')}
            >
              매출
              <SortIcon columnKey="revenue" />
            </th>
            <th
              className={`${HEADER_CELL_STYLES} ${HEADER_CELL_RIGHT_STYLES}`}
              onClick={() => handleSort('roas')}
            >
              ROAS
              <SortIcon columnKey="roas" />
            </th>
            <th
              className={`${HEADER_CELL_STYLES} ${HEADER_CELL_RIGHT_STYLES}`}
              onClick={() => handleSort('impressions')}
            >
              노출
              <SortIcon columnKey="impressions" />
            </th>
            <th
              className={`${HEADER_CELL_STYLES} ${HEADER_CELL_RIGHT_STYLES}`}
              onClick={() => handleSort('clicks')}
            >
              클릭
              <SortIcon columnKey="clicks" />
            </th>
            <th
              className={`${HEADER_CELL_STYLES} ${HEADER_CELL_RIGHT_STYLES}`}
              onClick={() => handleSort('ctr')}
            >
              CTR
              <SortIcon columnKey="ctr" />
            </th>
            <th
              className={`${HEADER_CELL_STYLES} ${HEADER_CELL_RIGHT_STYLES}`}
              onClick={() => handleSort('conversions')}
            >
              전환
              <SortIcon columnKey="conversions" />
            </th>
            <th
              className={`${HEADER_CELL_STYLES} ${HEADER_CELL_RIGHT_STYLES}`}
              onClick={() => handleSort('cvr')}
            >
              CVR
              <SortIcon columnKey="cvr" />
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedCampaigns.map((campaign) => (
            <tr key={campaign.campaign_id} className={BODY_ROW_STYLES}>
              <td className={`${CELL_STYLES} ${CELL_NAME_STYLES}`}>
                {campaign.campaign_name}
              </td>
              <td className={`${CELL_STYLES} ${CELL_VALUE_STYLES}`}>
                {formatCurrency(campaign.spend)}
              </td>
              <td className={`${CELL_STYLES} ${CELL_VALUE_STYLES}`}>
                {formatCurrency(campaign.revenue)}
              </td>
              <td className={`${CELL_STYLES} text-right`}>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getRoasBadgeStyle(campaign.roas)}`}
                >
                  {campaign.roas.toFixed(2)}
                </span>
              </td>
              <td className={`${CELL_STYLES} ${CELL_VALUE_STYLES}`}>
                {formatNumber(campaign.impressions)}
              </td>
              <td className={`${CELL_STYLES} ${CELL_VALUE_STYLES}`}>
                {formatNumber(campaign.clicks)}
              </td>
              <td className={`${CELL_STYLES} ${CELL_VALUE_STYLES}`}>
                {formatPercent(campaign.ctr)}
              </td>
              <td className={`${CELL_STYLES} ${CELL_VALUE_STYLES}`}>
                {formatNumber(campaign.conversions)}
              </td>
              <td className={`${CELL_STYLES} ${CELL_VALUE_STYLES}`}>
                {formatPercent(campaign.cvr)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CampaignTable;
