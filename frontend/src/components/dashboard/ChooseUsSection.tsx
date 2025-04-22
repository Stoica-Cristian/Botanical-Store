import chooseUs from "../../assets/chooseUs.jpg";
import plant1 from "../../assets/dashboard/plant-leaf-svgrepo-com.svg";
import plant2 from "../../assets/dashboard/cactus-svgrepo-com.svg";
import plant3 from "../../assets/dashboard/plant-svgrepo-com.svg";

const benefits = [
  {
    icon: plant1,
    title: "Quality Service",
    description:
      "We ensure that our services meet the highest standards of quality.",
  },
  {
    icon: plant2,
    title: "Expert Team",
    description:
      "Our team consists of experts in their respective fields, ensuring you get the best service possible.",
  },
  {
    icon: plant3,
    title: "Customer Satisfaction",
    description:
      "We prioritize customer satisfaction and strive to exceed your expectations.",
  },
];

const DashboardChooseUsSection = () => {
  return (
    <section
      className="max-w-7xl mx-auto p-10 pt-10 md:pt-16 lg:pt-20 xl:pt-22 pb-10 xl:pb-12"
      aria-labelledby="choose-us-title"
    >
      <div className="flex flex-wrap">
        <div className="w-full lg:w-1/2 px-4">
          <img
            src={chooseUs}
            className="w-full h-auto"
            alt="Our team providing professional services"
            loading="lazy"
          />
        </div>

        <div className="w-full lg:w-1/2 pr-4 px-4">
          <div className="w-full flex flex-col items-start mb-8 lg:mb-10 xl:mb-12">
            <h2
              id="choose-us-title"
              className="text-5xl font-extrabold font-playfair relative"
            >
              Why choose us ?
            </h2>
            <div
              className="w-1/2 h-1.5 bg-accent mt-4 md:mt-5"
              role="presentation"
            ></div>
          </div>
          <p className="mb-10 xl:mb-14">
            We provide the best services for your needs. Our team is dedicated
            to ensuring your satisfaction. We offer a wide range of services
            tailored to meet your requirements. Our commitment to quality and
            excellence sets us apart from the rest.
          </p>

          <ul className="choose-list" role="list">
            {benefits.map((benefit, index) => (
              <li
                key={index}
                className={`flex justify-start gap-2 ${
                  index !== benefits.length - 1 ? "mb-3 lg:mb-4 xl:mb-5" : ""
                }`}
              >
                <img
                  src={benefit.icon}
                  className="h-16 w-16 lg:h-20 lg:w-20"
                  alt={`${benefit.title} icon`}
                />
                <div className="flex justify-start flex-wrap">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
                    {benefit.title}
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg">
                    {benefit.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default DashboardChooseUsSection;
