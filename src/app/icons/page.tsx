import {
  BackIcon,
  ArrowDownIcon,
  CallIcon,
  CallSingleIcon,
  CarIcon,
  CartIcon,
  CompareIcon,
  SearchNewIcon,
  EyeIcon,
  GridIcon,
  HamburgurIcon,
  ListGridIcon,
  ListIcon,
  ListOneIcon,
  ListSvgIcon,
  MapIcon,
  SearchIcon,
  TableSvgIcon,
  StarIcon,
  UserIcon,
  WishIcon,
  GridSvgIcon,
} from "@/components/Icon";

export default function IconsPage() {
  const icons = [
    { name: "BackIcon", component: BackIcon },
    { name: "SearchIcon", component: SearchIcon },
    { name: "SearchNewIcon", component: SearchNewIcon },
    { name: "CompareIcon", component: CompareIcon },
    { name: "UserIcon", component: UserIcon },
    { name: "CartIcon", component: CartIcon },
    { name: "CarIcon", component: CarIcon },
    { name: "MapIcon", component: MapIcon },
    { name: "CallIcon", component: CallIcon },
    { name: "CallSingleIcon", component: CallSingleIcon },
    { name: "WishIcon", component: WishIcon },
    { name: "ListGridIcon", component: ListGridIcon },
    { name: "ListOneIcon", component: ListOneIcon },
    { name: "GridIcon", component: GridIcon },
    { name: "ListIcon", component: ListIcon },
    { name: "TableSvgIcon", component: TableSvgIcon },
    { name: "GridSvgIcon", component: GridSvgIcon },
    { name: "ListSvgIcon", component: ListSvgIcon },
    { name: "StarIcon", component: StarIcon },
    { name: "ArrowDownIcon", component: ArrowDownIcon },
    { name: "HamburgurIcon", component: HamburgurIcon },
    { name: "EyeIcon", component: EyeIcon },
  ] as const;

  return (
    <main className="container py-10">
      <h1 className="mb-6 text-2xl font-semibold">All Icons Demo</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {icons.map(({ name, component: IconComponent }) => (
          <div
            key={name}
            className="rounded-lg border border-gray-300 p-4 text-center"
          >
            <IconComponent size={24} className="mx-auto text-black" />
            <p className="mt-2 text-xs">{name}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
