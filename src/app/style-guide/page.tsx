import { CartIcon, EyeIcon } from "@/components/Icon";

const lightColors = [
  { name: "Primary", hex: "#ff003c" },
  { name: "Secondary", hex: "#ffea00" },
  { name: "Tertiary", hex: "#173e66" },
  { name: "Black", hex: "#000000" },
  { name: "Dark Gray", hex: "#545a60" },
  { name: "Gray Medium", hex: "#c4c4c4" },
  { name: "Gray Extra Medium", hex: "#a9a9a9" },
  { name: "Gray Light", hex: "#dddddd" },
  { name: "White", hex: "#ffffff", border: true },
  { name: "Label", hex: "#007a22" },
  { name: "Tertiary", hex: "#173e66" },
];

const darkColors = [
  { name: "Primary", hex: "#ff003c" },
  { name: "Secondary", hex: "#ffea00" },
  { name: "Tertiary", hex: "#173e66" },
  { name: "Black", hex: "#000000", border: true },
  { name: "Dark Gray", hex: "#545a60" },
  { name: "Gray Medium", hex: "#c4c4c4" },
  { name: "Gray Light", hex: "#dddddd" },
  { name: "White", hex: "#ffffff" },
];

function ColorTile({
  name,
  hex,
  border,
}: {
  name: string;
  hex: string;
  border?: boolean;
}) {
  return (
    <div className="w-16 text-center">
      <div
        className={`mx-auto h-10 w-10 rounded-sm ${border ? "border border-gray-400" : ""}`}
        style={{ backgroundColor: hex }}
      />
      <p className="mt-2 text-[10px] leading-tight">{name}</p>
    </div>
  );
}

function InputPreview({ mobile = false }: { mobile?: boolean }) {
  const inputBase =
    "w-full border px-3 py-2 text-[10px] text-[#232323] outline-none transition-colors";
  const eyeIcon = <EyeIcon size={12} className="text-[#6f6f72]" />;

  return (
    <div className={`${mobile ? "w-[320px]" : "w-[320px]"} rounded border border-dashed border-[#cca7d7] p-4`}>
      <div className="mb-3">
        <div className="flex items-center border border-[#ececed] bg-[#f8f8f8] px-3 py-2">
          <input
            type="text"
            defaultValue="John Doe"
            className={`${inputBase} border-0 bg-transparent p-0 text-[#c5c5c8]`}
          />
          <span>{eyeIcon}</span>
        </div>
      </div>

      <div className="mb-3">
        <label className="mb-1 block text-[8px] text-[#7f8084]">Username</label>
        <div className="flex items-center border border-[#e2e2e4] px-3 py-2">
          <input type="text" defaultValue="John Doe" className={`${inputBase} border-0 p-0`} />
          <span>{eyeIcon}</span>
        </div>
      </div>

      <div className="mb-3">
        <label className="mb-1 block text-[8px] text-[#7f8084]">Username</label>
        <div className="flex items-center border border-[#7f8084] px-3 py-2">
          <input type="text" defaultValue="John Doe" className={`${inputBase} border-0 p-0`} />
          <span>{eyeIcon}</span>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center border border-[#ececed] bg-[#f8f8f8] px-3 py-2">
          <input
            type="text"
            defaultValue="John Doe"
            className={`${inputBase} border-0 bg-transparent p-0 text-[#c5c5c8]`}
          />
          <span className="text-[#c5c5c8]">{eyeIcon}</span>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-[8px] text-[#ff2f74]">Username</label>
        <div className="flex items-center border border-[#ff6b99] px-3 py-2">
          <input
            type="text"
            defaultValue="John Doe"
            className={`${inputBase} border-0 p-0 text-[#111]`}
          />
          <span className="text-[#ff2f74]">{eyeIcon}</span>
        </div>
      </div>
    </div>
  );
}

export default function StyleGuidePage() {
  return (
    <main className="container py-8">
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold">Typography</h2>
        <div className="mb-6 border-t border-gray-400" />
        <div className="grid max-w-xl grid-cols-2 gap-y-4">
          <p className="text-[36px] font-semibold">Title 1</p>
          <p className="text-base">Body 1</p>
          <p className="text-[24px] font-semibold">Title 2</p>
          <p className="text-sm">Body 2</p>
          <p className="text-[18px] font-semibold">Title 3</p>
          <p className="text-xs">Body 3</p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold">Colors-Light</h2>
        <div className="mb-6 border-t border-gray-400" />
        <div className="flex flex-wrap gap-4">
          {lightColors.map((color, index) => (
            <ColorTile key={`light-${index}-${color.name}-${color.hex}`} {...color} />
          ))}
        </div>
      </section>

      <section className="mb-10 bg-[#1f2124] p-4">
        <h2 className="mb-3 text-xl font-semibold text-white">Colors-Dark</h2>
        <div className="mb-6 border-t border-gray-500" />
        <div className="flex flex-wrap gap-4">
          {darkColors.map((color, index) => (
            <ColorTile key={`dark-${index}-${color.name}-${color.hex}`} {...color} />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold">CTA & Colors</h2>
        <div className="mb-6 border-t border-gray-400" />
        <div className="flex flex-wrap items-start gap-8">
          <div className="rounded border border-dashed border-[#cca7d7] p-4">
            <button className="mb-3 block w-32 bg-[#ffea00] px-2 py-2 text-[11px] font-semibold text-[#111]">
              <span className="inline-flex items-center gap-1">
                ADD TO CART
                <CartIcon size={11} />
              </span>
            </button>
            <button className="block w-32 bg-black px-2 py-2 text-[11px] font-semibold text-white">
              <span className="inline-flex items-center gap-1">
                ADD TO CART
                <CartIcon size={11} />
              </span>
            </button>
          </div>

          <div className="rounded border border-dashed border-[#cca7d7] p-4">
            <button className="mb-3 block w-32 border border-[#e26a8d] px-2 py-2 text-[11px] font-semibold text-[#e13e73]">
              ADD TO CART
            </button>
            <button className="block w-32 bg-[#ff003c] px-2 py-2 text-[11px] font-semibold text-white">
              ADD TO CART
            </button>
          </div>

          <div className="rounded border border-dashed border-[#cca7d7] p-4">
            <button className="mb-3 block w-32 bg-[#ff003c] px-2 py-2 text-[11px] font-semibold text-white">
              ADD TO CART
            </button>
            <button className="block w-32 bg-black px-2 py-2 text-[11px] font-semibold text-white">
              ADD TO CART
            </button>
          </div>

          <div className="flex gap-5 rounded border border-dashed border-[#cca7d7] p-4">
            <label className="flex h-[72px] w-[34px] cursor-pointer flex-col items-center justify-center gap-3 rounded border border-[#c48ad4]">
              <input type="radio" name="style-radio" className="h-3 w-3 accent-[#ff003c]" />
            </label>
            <label className="flex h-[72px] w-[34px] cursor-pointer flex-col items-center justify-center gap-3 rounded border border-[#c48ad4]">
              <input type="checkbox" className="h-3 w-3 accent-[#ff003c]" defaultChecked />
            </label>
          </div>

        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Input Text</h2>
        <div className="mb-6 border-t border-gray-400" />
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-lg font-semibold">Web</h3>
            <InputPreview />
          </div>
        </div>
      </section>
    </main>
  );
}
