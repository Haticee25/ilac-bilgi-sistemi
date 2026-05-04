import { X, Pill, Users, AlertTriangle, Target } from 'lucide-react';

interface Drug {
  name: string;
  activeIngredient: string;
  usage: string;
  sideEffects: string;
  ageRange: string;
}

interface DrugInfoProps {
  drug: Drug;
  onClose: () => void;
}

export function DrugInfo({ drug, onClose }: DrugInfoProps) {
  if (!drug) return null;

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-blue-100 mt-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
          title="Kapat"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <Pill className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">{drug.name}</h2>
            <p className="text-blue-100 mt-1">İlaç Detay Bilgileri</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Etken Madde */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border-2 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Pill className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 mb-2">Etken Madde</h3>
                <p className="text-blue-800">{drug.activeIngredient}</p>
              </div>
            </div>
          </div>

          {/* Kullanım Amacı */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border-2 border-green-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-green-900 mb-2">Kullanım Amacı</h3>
                <p className="text-green-800">{drug.usage}</p>
              </div>
            </div>
          </div>

          {/* Yan Etkiler */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-xl border-2 border-red-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-900 mb-2">Olası Yan Etkiler</h3>
                <p className="text-red-800 text-sm">{drug.sideEffects}</p>
              </div>
            </div>
          </div>

          {/* Yaş Aralığı */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border-2 border-purple-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-purple-900 mb-2">Yaş Aralığı</h3>
                <p className="text-purple-800 text-xl font-bold">{drug.ageRange}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-700 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-yellow-800 font-medium">
                <strong>Uyarı:</strong> Bu bilgiler genel bilgilendirme amaçlıdır. İlaç kullanmadan önce mutlaka bir sağlık profesyoneline danışın.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}