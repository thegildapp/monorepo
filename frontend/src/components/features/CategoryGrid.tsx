import styles from './CategoryGrid.module.css';

export interface Category {
  id: number;
  name: string;
  icon?: string | null;
  href?: string;
}

interface CategoryGridProps {
  categories: Category[];
  onCategoryClick?: (category: Category) => void;
}

export default function CategoryGrid({ categories, onCategoryClick }: CategoryGridProps) {
  return (
    <section className={styles.categoriesSection}>
      <div className={styles.categoriesGrid}>
        {categories.map((category) => (
          <a 
            key={category.id} 
            href={category.href || "#"} 
            className={styles.categoryCard}
            onClick={(e) => {
              if (onCategoryClick) {
                e.preventDefault();
                onCategoryClick(category);
              }
            }}
          >
            {category.icon && <img src={category.icon} alt="" className={styles.categoryIcon} />}
            <span className={styles.categoryName}>{category.name}</span>
          </a>
        ))}
      </div>
    </section>
  );
}