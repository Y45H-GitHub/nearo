import { notFound } from "next/navigation";
import { ListingWizard } from "@/features/listings/components/listing-wizard";
import { getCategoryTree, getProductForEdit } from "@/features/listings/queries";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getProductForEdit(id);
  if (!result) notFound();

  const categories = await getCategoryTree();
  const { product, images } = result;

  return (
    <ListingWizard
      mode="edit"
      productId={product.id}
      categories={categories}
      initial={{
        title: product.title,
        description: product.description,
        categoryId: product.category_id,
        subcategoryId: product.subcategory_id ?? "",
        brand: product.brand ?? "",
        model: product.model ?? "",
        condition: product.condition,
        pricePerDay: String(product.price_per_day),
        securityDeposit: String(product.security_deposit),
        minRentalDays: String(product.min_rental_days),
        maxRentalDays: product.max_rental_days ? String(product.max_rental_days) : "",
        pickupAvailable: product.pickup_available,
        deliveryAvailable: product.delivery_available,
        deliveryRadiusKm: product.delivery_radius_km ? String(product.delivery_radius_km) : "",
        addressText: product.address_text,
        city: product.city,
        lat: product.lat,
        lng: product.lng,
        visibilityRadiusKm: String(product.visibility_radius_km),
        images: images.map((img, i) => ({
          url: img.url,
          isCover: img.is_cover,
          sortOrder: img.sort_order ?? i,
          tempId: img.id,
        })),
        availabilityBlocks: [],
      }}
    />
  );
}
