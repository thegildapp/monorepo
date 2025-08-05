import Header from '../layout/Header';
import Layout from '../layout/Layout';
import Main from '../layout/Main';
import styles from './AboutPage.module.css';

function AboutPage() {
  return (
    <Layout>
      <Header logoText="Gild" showSearch={false} />
      <Main>
        <div className={styles.container}>
          <div className={styles.content}>
          <section className={styles.section}>
            <h2>About Our Business</h2>
            <p>
              Gild is a trusted online marketplace that connects buyers and sellers for a wide variety of goods. 
              Our platform enables individuals and businesses to list items for sale, browse available products, 
              and complete secure transactions.
            </p>
          </section>

          <section className={styles.section}>
            <h2>What We Offer</h2>
            <ul className={styles.list}>
              <li>A secure platform for buying and selling goods</li>
              <li>User verification and rating systems</li>
              <li>Secure messaging between buyers and sellers</li>
              <li>Location-based search to find items near you</li>
              <li>Categories including electronics, furniture, vehicles, clothing, and more</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>Contact Information</h2>
            <div className={styles.contactInfo}>
              <p>Email: contact@thegild.app</p>
              <p>Business Hours: Monday - Friday, 9 AM - 6 PM PST</p>
              <p>Response Time: We aim to respond to all inquiries within 24 hours</p>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Terms of Service</h2>
            <div className={styles.policy}>
              <h3>1. Acceptance of Terms</h3>
              <p>By accessing and using Gild, you accept and agree to be bound by the terms and provision of this agreement.</p>
              
              <h3>2. Use of the Platform</h3>
              <p>Gild is a marketplace platform. We facilitate transactions between buyers and sellers but are not a party to the actual sales.</p>
              
              <h3>3. User Responsibilities</h3>
              <ul>
                <li>Users must provide accurate information in listings</li>
                <li>Users are responsible for complying with all applicable laws</li>
                <li>Prohibited items may not be listed or sold</li>
                <li>Users must complete transactions in good faith</li>
              </ul>
              
              <h3>4. Fees</h3>
              <p>Gild may charge service fees for certain features or transactions. All fees will be clearly disclosed before any charges are made.</p>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Privacy Policy</h2>
            <div className={styles.policy}>
              <h3>Information We Collect</h3>
              <p>We collect information you provide directly to us, such as when you create an account, list an item, or contact us for support.</p>
              
              <h3>How We Use Your Information</h3>
              <ul>
                <li>To provide, maintain, and improve our services</li>
                <li>To process transactions and send related information</li>
                <li>To send technical notices and support messages</li>
                <li>To respond to your comments and questions</li>
              </ul>
              
              <h3>Information Security</h3>
              <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing.</p>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Refund, Return & Cancellation Policy</h2>
            <div className={styles.policy}>
              <h3>For Buyers</h3>
              <ul>
                <li>Refunds: Refunds are handled directly between buyers and sellers. Gild recommends inspecting items before completing a purchase.</li>
                <li>Returns: Return policies are set by individual sellers and should be agreed upon before purchase.</li>
                <li>Cancellations: Buyers may cancel a transaction before meeting the seller. Once a transaction is completed, cancellation policies are determined by the seller.</li>
              </ul>
              
              <h3>For Sellers</h3>
              <ul>
                <li>Sellers are encouraged to clearly state their return and refund policies in their listings</li>
                <li>Sellers may cancel a listing at any time before a transaction is completed</li>
              </ul>
              
              <h3>Dispute Resolution</h3>
              <p>
                In case of disputes between buyers and sellers, Gild provides a communication platform but does not directly mediate transactions. 
                Users are encouraged to resolve disputes amicably. For unresolved issues, users may need to seek resolution through appropriate legal channels.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Shipping & Delivery</h2>
            <div className={styles.policy}>
              <p>
                Shipping and delivery arrangements are made directly between buyers and sellers. 
                Gild recommends discussing delivery methods, costs, and timelines before completing a transaction.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Legal Restrictions</h2>
            <div className={styles.policy}>
              <h3>Prohibited Items</h3>
              <p>The following items may not be listed or sold on Gild:</p>
              <ul>
                <li>Illegal items or substances</li>
                <li>Weapons and ammunition</li>
                <li>Stolen goods</li>
                <li>Counterfeit or unauthorized items</li>
                <li>Items that violate intellectual property rights</li>
                <li>Any items prohibited by local, state, or federal law</li>
              </ul>
              
              <h3>Export Restrictions</h3>
              <p>Users are responsible for complying with all applicable export and import laws.</p>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Promotions & Special Offers</h2>
            <div className={styles.policy}>
              <p>
                Any promotions or special offers will be clearly marked with their terms and conditions, 
                including expiration dates and any restrictions that apply.
              </p>
            </div>
          </section>

          <div className={styles.footer}>
            <p className={styles.lastUpdated}>Last updated: January 2025</p>
            <p className={styles.copyright}>© 2025 Gild Marketplace. All rights reserved.</p>
          </div>
        </div>
      </div>
      </Main>
    </Layout>
  );
}

export default AboutPage;