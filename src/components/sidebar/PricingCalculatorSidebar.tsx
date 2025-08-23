// components/sidebar/PricingCalculatorSidebar.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DocumentTextIcon, HashtagIcon, ClockIcon } from '@heroicons/react/24/outline';
import type { ServiceType, EnhancedPricingData } from '@/types';
import { calculateEnhancedPricing } from '@/lib/pricing/engine'; // Assuming this path is correct

interface PricingCalculatorSidebarProps {
  formData: {
    serviceType?: ServiceType;
    pages: number;
    deadline: string;
    documentType: string;
  };
}

export function PricingCalculatorSidebar({ formData }: PricingCalculatorSidebarProps) {
  const pricing: EnhancedPricingData | null =
    formData.serviceType && formData.pages > 0 && formData.deadline
      ? calculateEnhancedPricing({
          serviceType: formData.serviceType,
          pages: formData.pages,
          deadline: formData.deadline,
          documentType: formData.documentType,
        })
      : null;

  const getUnitLabel = () => {
    return formData.serviceType === 'presentation' ? 'slide' : 'page';
  };

  if (!pricing) {
    return (
      <Card className="p-6 text-center text-gray-500 bg-white shadow-sm">
        <DocumentTextIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" />
        <p className="text-sm font-medium">Your price will appear here</p>
        <p className="text-xs text-gray-400">Complete the final details to get a live quote.</p>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Live Price */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">Total Price</p>
          <p className="text-4xl font-bold text-gray-900 tracking-tight">
            ${pricing.totalPrice.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ${pricing.pricePerPage.toFixed(2)} per {getUnitLabel()}
          </p>
        </div>

        <Separator className="my-4" />

        {/* Order Details */}
        <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between items-center">
                <span className="flex items-center text-gray-600"><HashtagIcon className="w-4 h-4 mr-2"/>Pages</span>
                <span className="font-medium text-gray-800">{formData.pages}</span>
            </div>
             <div className="flex justify-between items-center">
                <span className="flex items-center text-gray-600"><ClockIcon className="w-4 h-4 mr-2"/>Deadline</span>
                <span className="font-medium text-gray-800">{formData.deadline} Days</span>
            </div>
        </div>

        <Separator className="my-4" />

        {/* Pricing Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Base Price</span>
            <span className="text-gray-800">${pricing.basePrice.toFixed(2)}</span>
          </div>

          {pricing.savings > 0 && (
            <div className="flex justify-between">
              <span className="text-green-600">Volume Discount ({pricing.discountPercentage}%)</span>
              <span className="font-medium text-green-600">-${pricing.savings.toFixed(2)}</span>
            </div>
          )}

          {pricing.rushFee > 0 && (
            <div className="flex justify-between">
              <span className="text-orange-600">Urgency Fee</span>
              <span className="font-medium text-orange-600">+${pricing.rushFee.toFixed(2)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}