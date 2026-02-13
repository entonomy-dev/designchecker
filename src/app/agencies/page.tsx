'use client';

import { useState } from 'react';

interface Agency {
  id: string;
  name: string;
  founded: number;
  location: {
    city: string;
    state: string;
    country: string;
    address: string;
  };
  size: {
    employees: number;
    range: string;
  };
  services: string[];
  contact: {
    website: string;
    phone?: string;
    email?: string;
  };
  leadership?: {
    ceo?: string;
    founder?: string;
    title?: string;
  };
  pricing?: {
    hourlyRate?: number;
    minimumBudget?: string;
  };
  specialization: string;
  targetCustomer: string;
  painPoints: string[];
}

const agencies: Agency[] = [
  {
    id: "forefront-web",
    name: "ForeFront Web",
    founded: 2001,
    location: {
      city: "Dublin",
      state: "OH",
      country: "USA",
      address: "7155 Post Road, Dublin, OH 43016"
    },
    size: {
      employees: 13,
      range: "10-49"
    },
    services: [
      "Web Design & Development",
      "SEO",
      "Social Media Marketing",
      "PPC",
      "Branding",
      "Conversion Optimization",
      "Website Maintenance"
    ],
    pricing: {
      hourlyRate: 150,
      minimumBudget: "$15,000"
    },
    contact: {
      website: "https://forefrontweb.com",
      phone: "Available on website"
    },
    specialization: "Google Premier Partner - Top 3% of US agencies",
    targetCustomer: "Mid-market businesses seeking comprehensive digital marketing",
    painPoints: [
      "Need for integrated web design and SEO",
      "ROI-focused marketing solutions",
      "Ongoing website optimization"
    ]
  },
  {
    id: "bop-design",
    name: "Bop Design",
    founded: 2008,
    location: {
      city: "San Diego",
      state: "CA",
      country: "USA",
      address: "401 W A Street Suite 200, San Diego, CA 92101"
    },
    size: {
      employees: 35,
      range: "28-43"
    },
    leadership: {
      ceo: "Kara Jensen",
      founder: "Jeremy Durant"
    },
    services: [
      "B2B Web Design",
      "Content Marketing",
      "Branding",
      "Digital Marketing"
    ],
    contact: {
      website: "https://www.bopdesign.com",
      phone: "888-670-7803",
      email: "info@bopdesign.com"
    },
    pricing: {
      hourlyRate: 0
    },
    specialization: "B2B focused agency with expertise in complex sales cycles",
    targetCustomer: "B2B companies needing lead generation and brand positioning",
    painPoints: [
      "B2B website conversion optimization",
      "Lead generation through design",
      "Brand differentiation in crowded markets"
    ]
  },
  {
    id: "design-in-dc",
    name: "Design In DC",
    founded: 2016,
    location: {
      city: "Washington",
      state: "DC",
      country: "USA",
      address: "1101 Connecticut Ave Northwest Suite 450 #94, Washington DC 20036"
    },
    size: {
      employees: 50,
      range: "50-99"
    },
    services: [
      "Web Design",
      "Web Development",
      "Branding",
      "Digital Marketing",
      "Design Audits",
      "Accessibility Compliance",
      "CRO"
    ],
    pricing: {
      hourlyRate: 160,
      minimumBudget: "$10,000-$25,000"
    },
    contact: {
      website: "https://designindc.com"
    },
    specialization: "Boutique agency serving top brands, NGOs, and government agencies",
    targetCustomer: "Government agencies, NGOs, enterprise brands in DMV area",
    painPoints: [
      "Complex compliance requirements",
      "Accessibility standards",
      "Design system consistency"
    ]
  },
  {
    id: "red-spot-design",
    name: "Red Spot Design",
    founded: 2001,
    location: {
      city: "Dallas",
      state: "TX",
      country: "USA",
      address: "3010 Lyndon B Johnson Fwy Fl 1200, Dallas, TX 75234"
    },
    size: {
      employees: 6,
      range: "4-6"
    },
    leadership: {
      ceo: "David Russell"
    },
    services: [
      "Web Design",
      "Internet Marketing",
      "SEO",
      "Website Hosting"
    ],
    contact: {
      website: "https://www.redspotdesign.com",
      phone: "214-432-1608",
      email: "[email protected]"
    },
    specialization: "Small boutique agency with over 20 years experience",
    targetCustomer: "Small to mid-sized businesses needing full-service web solutions",
    painPoints: [
      "Cost-effective web design",
      "Ongoing maintenance and hosting",
      "Local Dallas market presence"
    ]
  },
  {
    id: "o8-agency",
    name: "O8",
    founded: 2010,
    location: {
      city: "Minneapolis",
      state: "MN",
      country: "USA",
      address: "5123 W. 98th St. #1242"
    },
    size: {
      employees: 30,
      range: "11-50"
    },
    leadership: {
      founder: "Seth Viebrock",
      title: "Founder & CEO"
    },
    services: [
      "Digital Marketing",
      "Web Design",
      "Web Development",
      "HubSpot Services",
      "WordPress",
      "Drupal",
      "SEO",
      "UX Design",
      "Website Audit Services"
    ],
    contact: {
      website: "https://www.o8.agency",
      phone: "612-276-5880"
    },
    specialization: "Global multicultural team with HubSpot and WordPress expertise",
    targetCustomer: "Marketing teams needing HubSpot integration and web development",
    painPoints: [
      "HubSpot implementation and optimization",
      "Website audits and technical improvements",
      "UX and conversion optimization"
    ]
  },
  {
    id: "ewr-digital",
    name: "EWR Digital",
    founded: 1999,
    location: {
      city: "Houston",
      state: "TX",
      country: "USA",
      address: "13105 Northwest Fwy, #500-35, Houston, TX 77040"
    },
    size: {
      employees: 40,
      range: "11-50"
    },
    services: [
      "SEO Consulting",
      "PPC Services",
      "Web Design",
      "Web Development",
      "Graphic Design",
      "Branding",
      "Video Production",
      "AI-Driven Marketing",
      "Web Design Audits"
    ],
    contact: {
      website: "https://www.ewrdigital.com"
    },
    specialization: "26 years experience with enterprise clients in complex industries",
    targetCustomer: "Enterprise CMOs, CROs, and business leaders in complex B2B industries",
    painPoints: [
      "Complex industry-specific marketing",
      "Enterprise-scale SEO and paid media",
      "AI-driven growth systems"
    ]
  },
  {
    id: "digital-silk",
    name: "Digital Silk",
    founded: 1990,
    location: {
      city: "Multiple",
      state: "Multiple",
      country: "USA",
      address: "Multiple US Locations"
    },
    size: {
      employees: 150,
      range: "100-249"
    },
    leadership: {
      ceo: "Gabriel Shaoolian",
      title: "CEO & Founder"
    },
    services: [
      "Web Design",
      "Digital Strategy",
      "Brand Development",
      "Digital Marketing",
      "eCommerce"
    ],
    contact: {
      website: "https://www.digitalsilk.com"
    },
    specialization: "Enterprise-level digital experiences for Fortune 500 companies",
    targetCustomer: "Large enterprises and Fortune 500 companies",
    painPoints: [
      "Enterprise-scale digital transformation",
      "Brand positioning for major corporations",
      "Complex multi-stakeholder projects"
    ]
  },
  {
    id: "door3",
    name: "DOOR3",
    founded: 2000,
    location: {
      city: "New York",
      state: "NY",
      country: "USA",
      address: "New York, NY"
    },
    size: {
      employees: 45,
      range: "25-50"
    },
    services: [
      "UX Audit Services",
      "UX Design",
      "Web Development",
      "Product Design",
      "Technology Consulting"
    ],
    contact: {
      website: "https://www.door3.com"
    },
    specialization: "UX audit agency with holistic product assessment approach",
    targetCustomer: "Companies needing comprehensive UX audits and product improvements",
    painPoints: [
      "Product UX optimization",
      "Holistic user experience assessment",
      "Technology-design integration"
    ]
  }
];

export default function AgenciesPage() {
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [filterSize, setFilterSize] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredAgencies = agencies.filter(agency => {
    const matchesSearch = agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agency.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agency.location.state.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSize = filterSize === 'all' ||
                       (filterSize === 'small' && agency.size.employees <= 20) ||
                       (filterSize === 'medium' && agency.size.employees > 20 && agency.size.employees <= 50) ||
                       (filterSize === 'large' && agency.size.employees > 50);

    return matchesSearch && matchesSize;
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          marginBottom: '30px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            margin: '0 0 16px 0',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Agency Customer Database
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#666',
            margin: '0 0 24px 0',
            lineHeight: '1.6'
          }}>
            Comprehensive profiles of target digital marketing agencies for DesignChecker.
            Research conducted February 13, 2026 via agency directories, LinkedIn, and business intelligence databases.
          </p>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{
              background: '#f8f9ff',
              padding: '20px',
              borderRadius: '12px',
              border: '2px solid #667eea'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>8</div>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>Total Agencies</div>
            </div>
            <div style={{
              background: '#f8f9ff',
              padding: '20px',
              borderRadius: '12px',
              border: '2px solid #764ba2'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#764ba2' }}>589+</div>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>Total Market (USA)</div>
            </div>
            <div style={{
              background: '#f8f9ff',
              padding: '20px',
              borderRadius: '12px',
              border: '2px solid #667eea'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>$10K-$25K</div>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>Avg Project Budget</div>
            </div>
            <div style={{
              background: '#f8f9ff',
              padding: '20px',
              borderRadius: '12px',
              border: '2px solid #764ba2'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#764ba2' }}>4</div>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>Offer Design Audits</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <input
              type="text"
              placeholder="Search agencies by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: '1',
                minWidth: '250px',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '2px solid #e0e0e0',
                fontSize: '16px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
            <select
              value={filterSize}
              onChange={(e) => setFilterSize(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '2px solid #e0e0e0',
                fontSize: '16px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Sizes</option>
              <option value="small">Small (1-20)</option>
              <option value="medium">Medium (21-50)</option>
              <option value="large">Large (50+)</option>
            </select>
          </div>
        </div>

        {/* Agency Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {filteredAgencies.map((agency) => (
            <div
              key={agency.id}
              onClick={() => setSelectedAgency(agency)}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '28px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.25)';
                e.currentTarget.style.borderColor = '#667eea';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  margin: 0,
                  color: '#1a1a1a'
                }}>
                  {agency.name}
                </h2>
                <div style={{
                  background: agency.services.includes('Design Audits') ||
                             agency.services.includes('UX Audit Services') ||
                             agency.services.includes('Website Audit Services') ||
                             agency.services.includes('Web Design Audits')
                             ? '#10b981' : '#667eea',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap'
                }}>
                  {agency.services.includes('Design Audits') ||
                   agency.services.includes('UX Audit Services') ||
                   agency.services.includes('Website Audit Services') ||
                   agency.services.includes('Web Design Audits')
                   ? '🎯 AUDITS' : 'TARGET'}
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '16px',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  background: '#f0f4ff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#667eea',
                  fontWeight: '600'
                }}>
                  👥 {agency.size.employees} employees
                </div>
                <div style={{
                  background: '#f0f4ff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#667eea',
                  fontWeight: '600'
                }}>
                  📍 {agency.location.city}, {agency.location.state}
                </div>
                {agency.founded && (
                  <div style={{
                    background: '#f0f4ff',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#667eea',
                    fontWeight: '600'
                  }}>
                    📅 Since {agency.founded}
                  </div>
                )}
              </div>

              {agency.leadership && (
                <div style={{
                  marginBottom: '16px',
                  padding: '12px',
                  background: '#fef3c7',
                  borderRadius: '8px',
                  borderLeft: '4px solid #f59e0b'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#92400e' }}>
                    Decision Maker
                  </div>
                  <div style={{ fontSize: '14px', color: '#78350f', marginTop: '4px' }}>
                    {agency.leadership.ceo || agency.leadership.founder}
                    {agency.leadership.title && ` - ${agency.leadership.title}`}
                  </div>
                </div>
              )}

              <p style={{
                fontSize: '14px',
                color: '#666',
                lineHeight: '1.6',
                marginBottom: '16px'
              }}>
                {agency.specialization}
              </p>

              {agency.pricing && (agency.pricing.hourlyRate || agency.pricing.minimumBudget) && (
                <div style={{
                  marginBottom: '16px',
                  fontSize: '14px',
                  color: '#10b981',
                  fontWeight: 'bold'
                }}>
                  💰 {agency.pricing.hourlyRate ? `$${agency.pricing.hourlyRate}/hr` : ''}
                  {agency.pricing.hourlyRate && agency.pricing.minimumBudget ? ' • ' : ''}
                  {agency.pricing.minimumBudget || ''}
                </div>
              )}

              <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                {agency.services.slice(0, 3).map((service, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#e0e7ff',
                      color: '#4338ca',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    {service}
                  </span>
                ))}
                {agency.services.length > 3 && (
                  <span style={{
                    color: '#667eea',
                    padding: '4px 10px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    +{agency.services.length - 3} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Agency Detail Modal */}
        {selectedAgency && (
          <div
            onClick={() => setSelectedAgency(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              zIndex: 1000
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '40px',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '24px'
              }}>
                <h2 style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  margin: 0,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {selectedAgency.name}
                </h2>
                <button
                  onClick={() => setSelectedAgency(null)}
                  style={{
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '8px',
                    width: '40px',
                    height: '40px',
                    fontSize: '24px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#667eea' }}>
                  Company Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <strong>Location:</strong> {selectedAgency.location.city}, {selectedAgency.location.state}
                  </div>
                  <div>
                    <strong>Founded:</strong> {selectedAgency.founded}
                  </div>
                  <div>
                    <strong>Team Size:</strong> {selectedAgency.size.employees} employees ({selectedAgency.size.range})
                  </div>
                  {selectedAgency.pricing?.hourlyRate && (
                    <div>
                      <strong>Hourly Rate:</strong> ${selectedAgency.pricing.hourlyRate}/hr
                    </div>
                  )}
                </div>
                <div style={{ marginTop: '12px' }}>
                  <strong>Address:</strong> {selectedAgency.location.address}
                </div>
              </div>

              {selectedAgency.leadership && (
                <div style={{
                  marginBottom: '24px',
                  background: '#fef3c7',
                  padding: '16px',
                  borderRadius: '12px',
                  borderLeft: '4px solid #f59e0b'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#92400e' }}>
                    Leadership
                  </h3>
                  <div style={{ color: '#78350f' }}>
                    <strong>{selectedAgency.leadership.ceo || selectedAgency.leadership.founder}</strong>
                    {selectedAgency.leadership.title && ` - ${selectedAgency.leadership.title}`}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#667eea' }}>
                  Contact Information
                </h3>
                {selectedAgency.contact.website && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Website:</strong>{' '}
                    <a
                      href={selectedAgency.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#667eea', textDecoration: 'none' }}
                    >
                      {selectedAgency.contact.website}
                    </a>
                  </div>
                )}
                {selectedAgency.contact.phone && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Phone:</strong> {selectedAgency.contact.phone}
                  </div>
                )}
                {selectedAgency.contact.email && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Email:</strong>{' '}
                    <a
                      href={`mailto:${selectedAgency.contact.email}`}
                      style={{ color: '#667eea', textDecoration: 'none' }}
                    >
                      {selectedAgency.contact.email}
                    </a>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#667eea' }}>
                  Services Offered
                </h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedAgency.services.map((service, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: service.includes('Audit') ? '#d1fae5' : '#e0e7ff',
                        color: service.includes('Audit') ? '#065f46' : '#4338ca',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        border: service.includes('Audit') ? '2px solid #10b981' : 'none'
                      }}
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#667eea' }}>
                  Specialization
                </h3>
                <p style={{ lineHeight: '1.6', color: '#666' }}>
                  {selectedAgency.specialization}
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#667eea' }}>
                  Target Customer
                </h3>
                <p style={{ lineHeight: '1.6', color: '#666' }}>
                  {selectedAgency.targetCustomer}
                </p>
              </div>

              <div style={{
                background: '#fef2f2',
                padding: '20px',
                borderRadius: '12px',
                borderLeft: '4px solid #ef4444'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#991b1b' }}>
                  Pain Points (DesignChecker Opportunities)
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#7f1d1d' }}>
                  {selectedAgency.painPoints.map((pain, idx) => (
                    <li key={idx} style={{ marginBottom: '8px', lineHeight: '1.6' }}>
                      {pain}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#666',
            margin: 0
          }}>
            Research Date: February 13, 2026 | Sources: DesignRush, Clutch.co, Digital Agency Network, LinkedIn, Agency Websites
          </p>
        </div>
      </div>
    </div>
  );
}
