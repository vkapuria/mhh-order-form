// components/sidebar/TrustSidebar.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircleIcon, ShieldCheckIcon, StarIcon, ClockIcon } from '@heroicons/react/24/solid';

const guarantees = [
  { text: 'Plagiarism-free originality', icon: CheckCircleIcon },
  { text: 'On-time delivery, guaranteed', icon: ClockIcon },
  { text: 'Confidentiality and privacy', icon: ShieldCheckIcon },
];

export function TrustSidebar() {
  return (
    <div className="space-y-6">
      {/* Social Proof Card */}
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">4.9/5</p>
              <div className="flex justify-center text-yellow-400">
                <StarIcon className="w-4 h-4" /><StarIcon className="w-4 h-4" /><StarIcon className="w-4 h-4" /><StarIcon className="w-4 h-4" /><StarIcon className="w-4 h-4" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Average Rating</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">2,847+</p>
              <p className="text-xs text-gray-500 mt-1">Satisfied Students</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">98%</p>
              <p className="text-xs text-gray-500 mt-1">On-Time Delivery</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guarantees Card */}
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Our Guarantees</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {guarantees.map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={index} className="flex items-center">
                  <Icon className="w-5 h-5 text-[#8800e9]" />
                  <span className="ml-3 text-sm text-gray-700">{item.text}</span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
       {/* Security Badge */}
       <div className="flex items-center justify-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <ShieldCheckIcon className="w-6 h-6 text-green-600" />
          <p className="text-sm text-gray-600 font-medium">SSL Secured & Confidential</p>
        </div>
    </div>
  );
}