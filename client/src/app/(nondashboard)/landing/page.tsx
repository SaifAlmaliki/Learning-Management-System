"use client";

import React from "react";
import { motion } from "framer-motion";
// Import motion from Framer Motion for animations.
import Link from "next/link";
import Image from "next/image";
import { useCarousel } from "@/hooks/useCarousel";
// Import a custom hook for carousel functionality.

import { Skeleton } from "@/components/ui/skeleton";
// Import a Skeleton component for loading placeholders.

import { useGetCoursesQuery } from "@/state/api";
// Import a custom query hook for fetching courses from the state or API.

import { useRouter } from "next/navigation";
// Import Next.js useRouter for navigation functionality.

import CourseCardSearch from "@/components/CourseCardSearch";
// Import a custom component for displaying course details in a card format.

import { useUser } from "@clerk/nextjs";

const LoadingSkeleton = () => {
  // Functional component for displaying a skeleton loader while the page is loading.
  return (
    <div className="landing-skeleton">
      {/* Wrapper div for the skeleton structure. */}

      <div className="landing-skeleton__hero">
        {/* Skeleton loader for the hero section. */}

        <div className="landing-skeleton__hero-content">
          {/* Skeletons for the hero section content. */}
          <Skeleton className="landing-skeleton__title" />
          <Skeleton className="landing-skeleton__subtitle" />
          <Skeleton className="landing-skeleton__subtitle-secondary" />
          <Skeleton className="landing-skeleton__button" />
        </div>

        <Skeleton className="landing-skeleton__hero-image" />
        {/* Placeholder for the hero image. */}
      </div>

      <div className="landing-skeleton__featured">
        {/* Skeleton loader for the featured courses section. */}
        <Skeleton className="landing-skeleton__featured-title" />
        <Skeleton className="landing-skeleton__featured-description" />

        <div className="landing-skeleton__tags">
          {/* Placeholder skeletons for the tags. */}
          {[1, 2, 3, 4, 5].map((_, index) => (
            <Skeleton key={index} className="landing-skeleton__tag" />
          ))}
        </div>

        <div className="landing-skeleton__courses">
          {/* Placeholder skeletons for the course cards. */}
          {[1, 2, 3, 4].map((_, index) => (
            <Skeleton key={index} className="landing-skeleton__course-card" />
          ))}
        </div>
      </div>
    </div>
  );
};

const Landing = () => {
  const router = useRouter();
  // Router instance for navigating programmatically.

  const currentImage = useCarousel({ totalImages: 3 });
  // Custom hook for carousel functionality. `totalImages` sets the number of images.

  const { data: courses, isLoading, isError } = useGetCoursesQuery({});
  // Fetches course data and handles loading and error states.

  const { user } = useUser();
  const userRole = user?.publicMetadata?.role;

  const handleCourseClick = (courseId: string) => {
    // Function to handle clicks on a course card and navigate to the course details page.
    router.push(`/search?id=${courseId}`, {
      scroll: false, // Prevents scrolling to the top during navigation.
    });
  };

  if (isLoading) return <LoadingSkeleton />;
  // Renders the loading skeleton while course data is being fetched.

  return (
    <motion.div
      // Main container with fade-in animation for the entire page.
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="landing"
    >
      <motion.div
        // Hero section with slide-in animation.
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="landing__hero"
      >
        <div className="landing__hero-content">
          {/* Content of the hero section, including the title and description. */}
          <h1 className="landing__title">Courses</h1>
          <p className="landing__description">
            This is the list of the courses you can enroll in.
            <br />
            Courses when you need them and want them.
          </p>
          <div className="landing__cta flex gap-4">
            {/* Call-to-action button linking to the search page. */}
            <Link href="/search" scroll={false}>
              <div className="landing__cta-button">Search for Courses</div>
            </Link>
            {/* Role-specific navigation button */}
            {user && (
              <Link
                href={userRole === "teacher" ? "/teacher/courses" : "/user/courses"}
                scroll={false}
              >
                <div className="landing__cta-button">
                  {userRole === "teacher" ? "Go to Teacher Dashboard" : "Go to My Courses"}
                </div>
              </Link>
            )}
          </div>
        </div>
        <div className="landing__hero-images">
          {/* Carousel for hero images. Displays active image based on the current index. */}
          {["/hero1.jpg", "/hero2.jpg", "/hero3.jpg"].map((src, index) => (
            <Image
              key={src}
              src={src}
              alt={`Hero Banner ${index + 1}`}
              fill
              priority={index === currentImage}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`landing__hero-image ${
                index === currentImage ? "landing__hero-image--active" : ""
              }`}
            />
          ))}
        </div>
      </motion.div>
      <motion.div
        // Featured courses section with slide-in animation.
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ amount: 0.3, once: true }}
        className="landing__featured"
      >
        <h2 className="landing__featured-title">Featured Courses</h2>
        <p className="landing__featured-description">
          From beginner to advanced, in all industries, we have the right
          courses just for you and preparing your entire journey for learning
          and making the most.
        </p>

        <div className="landing__tags">
          {/* Tags for featured courses. */}
          {[
            "web development",
            "enterprise IT",
            "react nextjs",
            "javascript",
            "backend development",
          ].map((tag, index) => (
            <span key={index} className="landing__tag">
              {tag}
            </span>
          ))}
        </div>

        <div className="landing__courses">
          {/* Render course cards if courses data is available. */}
          {courses &&
            courses.slice(0, 4).map((course, index) => (
              <motion.div
                key={course.courseId}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ amount: 0.4 }}
              >
                <CourseCardSearch
                  // Custom component for displaying each course card.
                  course={course}
                  onClick={() => handleCourseClick(course.courseId)}
                />
              </motion.div>
            ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Landing;
// Export the Landing component as the default export.
