"use client";

import {
  Button,
  TextField,
  Chip,
  Avatar,
  Card,
  Badge,
  StatCard,
  ProgressBar,
  Tabs,
} from "../ui/base";
import { Section, ListRow, EmptyState, LoadingState } from "../ui/patterns";
import { useTranslation } from "../context/language-context";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrophy,
  faScroll,
  faUsers,
  faGamepad,
  faChartBar,
  faStar,
  faFire,
  faMedal,
  faBan,
} from "@fortawesome/free-solid-svg-icons";

export default function UITestPage() {
  const { t } = useTranslation();
  const [textValue, setTextValue] = useState("");
  const [textError, setTextError] = useState("");
  const [activeTab, setActiveTab] = useState("history");

  // React Hook Form example schema
  const formSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: any) => {
    alert("Form submitted: " + JSON.stringify(data, null, 2));
  };

  return (
    <div className="min-h-dvh bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-12">
          UI Components Test Page
        </h1>

        {/* Buttons Section */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Buttons</h2>

          <p className="text-sm text-gray-600 mb-2">
            Button variants (color styles)
          </p>
          <div className="flex flex-wrap gap-4 mb-6">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="ghost">Ghost</Button>
          </div>

          <p className="text-sm text-gray-600 mb-2">Button sizes</p>
          <div className="flex flex-wrap gap-4 mb-6">
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary" size="md">
              Medium
            </Button>
            <Button variant="primary" size="lg">
              Large
            </Button>
          </div>

          <p className="text-sm text-gray-600 mb-2">
            Special states: disabled and link
          </p>
          <div className="flex flex-wrap gap-4 mb-6">
            <Button variant="primary" disabled>
              Disabled
            </Button>
            <Button variant="primary" href="/">
              Link Button
            </Button>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg mb-6">
            <p className="text-sm md:text-base text-gray-600 text-blue-800 mb-2">
              With translations (from t):
            </p>
            <p className="text-xs text-gray-500 mb-2">
              Shows how buttons work with i18n
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">{t.game.playButton}</Button>
              <Button variant="secondary">{t.navigation.home}</Button>
            </div>
          </div>
        </section>

        {/* TextField Section */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">TextField</h2>

          <div className="max-w-md space-y-6">
            <TextField
              label="Username"
              placeholder="Enter your username"
              value={textValue}
              onChange={setTextValue}
            />

            <TextField
              label="Email"
              type="email"
              placeholder="Enter your email"
            />

            <TextField
              label="Password"
              type="password"
              placeholder="Enter password"
            />

            <TextField
              label="With Error"
              placeholder="This field has an error"
              error="This field is required"
            />

            <TextField label="Disabled" placeholder="Cannot edit" disabled />
          </div>
        </section>

        {/* TextField with React Hook Form Section */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            TextField with React Hook Form
          </h2>

          <div className="p-4 bg-blue-50 rounded-lg mb-4">
            <p className="text-sm text-blue-800 mb-2">
              This example shows TextField integrated with React Hook Form + Zod
              validation
            </p>
            <p className="text-xs text-gray-600">
              Try submitting with invalid values to see validation errors
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-md space-y-6"
          >
            <TextField
              name="username"
              label="Username (RHF)"
              placeholder="At least 3 characters"
              register={register}
              error={errors.username?.message as string}
            />

            <TextField
              name="email"
              type="email"
              label="Email (RHF)"
              placeholder="Enter valid email"
              register={register}
              error={errors.email?.message as string}
            />

            <TextField
              name="password"
              type="password"
              label="Password (RHF)"
              placeholder="At least 6 characters"
              register={register}
              error={errors.password?.message as string}
            />

            <Button type="submit" variant="primary">
              Submit Form
            </Button>
          </form>
        </section>

        {/* Chip Section */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Chip</h2>

          <div className="flex flex-wrap gap-3 mb-6">
            <Chip>Default</Chip>
            <Chip variant="success">Success</Chip>
            <Chip variant="warning">Warning</Chip>
            <Chip variant="error">Error</Chip>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm md:text-base text-gray-600 text-blue-800 mb-2">
              Example usage:
            </p>
            <div className="flex flex-wrap gap-2">
              <Chip variant="success">Online</Chip>
              <Chip variant="warning">In Game</Chip>
              <Chip variant="error">Offline</Chip>
            </div>
          </div>
        </section>

        {/* Avatar Section */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Avatar</h2>

          <p className="text-sm text-gray-600 mb-2">Avatar sizes</p>
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <Avatar size="sm" fallbackText="John Doe" />
            <Avatar size="md" fallbackText="John Doe" />
            <Avatar size="lg" fallbackText="John Doe" />
          </div>

          <p className="text-sm text-gray-600 mb-2">Avatar with image</p>
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <Avatar
              size="sm"
              src="/avatar/default-avatar.webp"
              alt="User avatar"
            />
            <Avatar
              size="md"
              src="/avatar/default-avatar.webp"
              alt="User avatar"
            />
            <Avatar
              size="lg"
              src="/avatar/default-avatar.webp"
              alt="User avatar"
            />
          </div>

          <p className="text-sm text-gray-600 mb-2">
            Avatar with fallback initials (different names)
          </p>
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <Avatar size="md" fallbackText="Alice" />
            <Avatar size="md" fallbackText="Bob" />
            <Avatar size="md" fallbackText="Charlie" />
            <Avatar size="md" fallbackText="Diana" />
          </div>

          <p className="text-sm text-gray-600 mb-2">
            Clickable avatar (hover to see effect)
          </p>
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <Avatar
              size="md"
              fallbackText="John Doe"
              onClick={() => alert("Avatar clicked!")}
            />
            <Avatar
              size="md"
              src="/avatar/default-avatar.webp"
              onClick={() => alert("Avatar with image clicked!")}
            />
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm md:text-base text-gray-600 text-blue-800 mb-2">
              Example usage in navigation:
            </p>
            <p className="text-xs text-gray-600 mb-2">
              Shows user's uploaded image, or first letter of nickname as
              fallback
            </p>
            <div className="flex gap-4 items-center">
              <Avatar
                size="md"
                src="/avatar/default-avatar.webp"
                fallbackText="SkyPong User"
                onClick={() => alert("Open user menu")}
              />
              <span className="text-sm text-gray-600">
                ← Click to open user menu
              </span>
            </div>
          </div>
        </section>

        {/* Card Section */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Card</h2>

          <p className="text-sm text-gray-600 mb-2">Card variants</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card variant="default" padding="md">
              <p className="text-sm text-gray-700">Default card with shadow</p>
            </Card>
            <Card variant="elevated" padding="md">
              <p className="text-sm text-gray-700">
                Elevated card with larger shadow
              </p>
            </Card>
            <Card variant="bordered" padding="md">
              <p className="text-sm text-gray-700">Bordered card (no shadow)</p>
            </Card>
            <Card variant="ghost" padding="md">
              <p className="text-sm text-gray-700">
                Ghost card (no background)
              </p>
            </Card>
          </div>

          <p className="text-sm text-gray-600 mb-2">
            Card with title and subtitle
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card
              variant="default"
              padding="md"
              title="Player Stats"
              subtitle="Last 30 days"
            >
              <p className="text-sm text-gray-700">Card content goes here</p>
            </Card>
            <Card
              variant="elevated"
              padding="md"
              title="Achievements"
              subtitle="15/20 unlocked"
              icon={
                <FontAwesomeIcon icon={faTrophy} className="text-primary" />
              }
            >
              <p className="text-sm text-gray-700">
                Card with icon, title, and subtitle
              </p>
            </Card>
          </div>

          <p className="text-sm text-gray-600 mb-2">Card padding variants</p>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card variant="default" padding="none">
              <div className="p-2 bg-purple-100 text-xs">
                No padding (add your own)
              </div>
            </Card>
            <Card variant="default" padding="sm">
              <p className="text-xs text-gray-700">Small padding</p>
            </Card>
            <Card variant="default" padding="md">
              <p className="text-xs text-gray-700">Medium padding</p>
            </Card>
            <Card variant="default" padding="lg">
              <p className="text-xs text-gray-700">Large padding</p>
            </Card>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">
              Example: Player profile card
            </p>
            <Card
              variant="elevated"
              padding="lg"
              title="SkyPong Master"
              subtitle="Level 42 • Rank #12"
            >
              <div className="space-y-2">
                <p className="text-sm text-gray-700">Win Rate: 68%</p>
                <p className="text-sm text-gray-700">Games Played: 156</p>
              </div>
            </Card>
          </div>
        </section>

        {/* Badge Section */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Badge</h2>

          <p className="text-sm text-gray-600 mb-2">Badge variants</p>
          <div className="flex flex-wrap gap-3 mb-6">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>

          <p className="text-sm text-gray-600 mb-2">Badge sizes</p>
          <div className="flex flex-wrap gap-3 items-center mb-6">
            <Badge variant="primary" size="sm">
              Small
            </Badge>
            <Badge variant="primary" size="md">
              Medium
            </Badge>
            <Badge variant="primary" size="lg">
              Large
            </Badge>
          </div>

          <p className="text-sm text-gray-600 mb-2">Badge shapes</p>
          <div className="flex flex-wrap gap-3 mb-6">
            <Badge variant="success" shape="rounded">
              Rounded
            </Badge>
            <Badge variant="warning" shape="pill">
              Pill
            </Badge>
            <Badge variant="danger" shape="square">
              Square
            </Badge>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">
              Example usage with player info:
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-gray-900 font-medium">PlayerName</span>
              <Badge variant="success" size="sm">
                Online
              </Badge>
              <Badge variant="info" size="sm">
                Pro
              </Badge>
              <Badge variant="warning" size="sm">
                In Game
              </Badge>
            </div>
          </div>
        </section>

        {/* StatCard Section */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">StatCard</h2>

          <p className="text-sm text-gray-600 mb-2">StatCard variants</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <StatCard label="Total Games" value="156" variant="default" />
            <StatCard label="Win Rate" value="68%" variant="primary" />
            <StatCard label="Victories" value="106" variant="success" />
            <StatCard label="Defeats" value="50" variant="danger" />
            <StatCard label="Current Streak" value="7" variant="warning" />
          </div>

          <p className="text-sm text-gray-600 mb-2">StatCard with icons</p>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <StatCard
              label="Games Played"
              value="156"
              icon={
                <FontAwesomeIcon icon={faGamepad} className="text-primary" />
              }
              variant="primary"
            />
            <StatCard
              label="Trophies"
              value="23"
              icon={
                <FontAwesomeIcon icon={faTrophy} className="text-primary" />
              }
              variant="success"
            />
            <StatCard
              label="Level"
              value="42"
              icon={<FontAwesomeIcon icon={faStar} className="text-primary" />}
              variant="warning"
            />
          </div>

          <p className="text-sm text-gray-600 mb-2">StatCard with trends</p>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <StatCard
              label="Win Rate"
              value="68%"
              variant="success"
              trend="up"
              trendValue="+5%"
            />
            <StatCard
              label="Average Score"
              value="1,234"
              variant="primary"
              trend="up"
              trendValue="+123"
            />
            <StatCard
              label="Rank"
              value="#12"
              variant="warning"
              trend="down"
              trendValue="-3"
            />
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">
              Example: Player stats grid
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Games"
                value="156"
                icon={
                  <FontAwesomeIcon icon={faGamepad} className="text-primary" />
                }
                variant="default"
              />
              <StatCard
                label="Win Rate"
                value="68%"
                icon={
                  <FontAwesomeIcon icon={faChartBar} className="text-primary" />
                }
                variant="success"
                trend="up"
                trendValue="+5%"
              />
              <StatCard
                label="Best Streak"
                value="12"
                icon={
                  <FontAwesomeIcon icon={faFire} className="text-primary" />
                }
                variant="warning"
              />
              <StatCard
                label="Rank"
                value="#12"
                icon={
                  <FontAwesomeIcon icon={faMedal} className="text-primary" />
                }
                variant="primary"
                trend="up"
                trendValue="+2"
              />
            </div>
          </div>
        </section>

        {/* ProgressBar Section */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            ProgressBar
          </h2>

          <p className="text-sm text-gray-600 mb-2">
            ProgressBar color variants
          </p>
          <div className="space-y-4 mb-6">
            <ProgressBar value={75} max={100} color="primary" />
            <ProgressBar value={60} max={100} color="success" />
            <ProgressBar value={45} max={100} color="danger" />
            <ProgressBar value={30} max={100} color="warning" />
            <ProgressBar value={90} max={100} color="info" />
            <ProgressBar value={50} max={100} color="neutral" />
          </div>

          <p className="text-sm text-gray-600 mb-2">ProgressBar sizes</p>
          <div className="space-y-4 mb-6">
            <ProgressBar value={75} max={100} size="sm" color="primary" />
            <ProgressBar value={75} max={100} size="md" color="primary" />
            <ProgressBar value={75} max={100} size="lg" color="primary" />
          </div>

          <p className="text-sm text-gray-600 mb-2">
            ProgressBar with label and percentage
          </p>
          <div className="space-y-4 mb-6">
            <ProgressBar
              value={85}
              max={100}
              color="success"
              label="Win Rate"
              showLabel
              showPercentage
            />
            <ProgressBar
              value={60}
              max={100}
              color="primary"
              label="Achievement Progress"
              showLabel
              showPercentage
            />
            <ProgressBar
              value={25}
              max={100}
              color="warning"
              label="Level Progress"
              showLabel
              showPercentage
            />
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">
              Example: Achievement card with progress
            </p>
            <Card variant="default" padding="md" title="Master Striker">
              <p className="text-sm text-gray-600 mb-3">Win 100 games</p>
              <ProgressBar
                value={68}
                max={100}
                color="success"
                label="Progress"
                showLabel
                showPercentage
              />
              <p className="text-xs text-gray-500 mt-2">68/100 games won</p>
            </Card>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Tabs</h2>

          <p className="text-sm text-gray-600 mb-2">
            Tabs variants - Underline (default)
          </p>
          <div className="mb-6">
            <Tabs
              variant="underline"
              tabs={[
                { key: "tab1", label: "Overview" },
                { key: "tab2", label: "Statistics" },
                { key: "tab3", label: "Settings" },
              ]}
              activeTab="tab1"
              // onChange={(key) => console.log('Tab changed:', key)}
            />
          </div>

          <p className="text-sm text-gray-600 mb-2">Tabs variants - Pills</p>
          <div className="mb-6">
            <Tabs
              variant="pills"
              tabs={[
                { key: "tab1", label: "All" },
                { key: "tab2", label: "Active" },
                { key: "tab3", label: "Completed" },
              ]}
              activeTab="tab2"
              // onChange={(key) => console.log('Tab changed:', key)}
            />
          </div>

          <p className="text-sm text-gray-600 mb-2">Tabs variants - Boxed</p>
          <div className="mb-6">
            <Tabs
              variant="boxed"
              tabs={[
                { key: "tab1", label: "Daily" },
                { key: "tab2", label: "Weekly" },
                { key: "tab3", label: "Monthly" },
              ]}
              activeTab="tab3"
              // onChange={(key) => console.log('Tab changed:', key)}
            />
          </div>

          <p className="text-sm text-gray-600 mb-2">Tabs with icons</p>
          <div className="mb-6">
            <Tabs
              variant="underline"
              tabs={[
                {
                  key: "tab1",
                  label: "History",
                  icon: (
                    <FontAwesomeIcon icon={faScroll} className="text-primary" />
                  ),
                },
                {
                  key: "tab2",
                  label: "Friends",
                  icon: (
                    <FontAwesomeIcon icon={faUsers} className="text-primary" />
                  ),
                },
                {
                  key: "tab3",
                  label: "Achievements",
                  icon: (
                    <FontAwesomeIcon icon={faTrophy} className="text-primary" />
                  ),
                },
              ]}
              activeTab="tab1"
              // onChange={(key) => console.log('Tab changed:', key)}
            />
          </div>

          <p className="text-sm text-gray-600 mb-2">Tabs with badges</p>
          <div className="mb-6">
            <Tabs
              variant="pills"
              tabs={[
                { key: "tab1", label: "Inbox", badge: "5" },
                { key: "tab2", label: "Sent" },
                { key: "tab3", label: "Archived", badge: "12" },
              ]}
              activeTab="tab1"
              // onChange={(key) => console.log('Tab changed:', key)}
            />
          </div>

          <p className="text-sm text-gray-600 mb-2">Tabs with disabled state</p>
          <div className="mb-6">
            <Tabs
              variant="underline"
              tabs={[
                { key: "tab1", label: "Available" },
                { key: "tab2", label: "Coming Soon", disabled: true },
                { key: "tab3", label: "Locked", disabled: true },
              ]}
              activeTab="tab1"
              // onChange={(key) => console.log('Tab changed:', key)}
            />
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 mb-3">
              Example: Player profile with tabs
            </p>
            <Card variant="default" padding="none">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <Avatar size="lg" fallbackText="John Doe" />
                  <div>
                    <h3 className="font-bold text-lg">John Doe</h3>
                    <p className="text-sm text-gray-600">Level 42 • Rank #12</p>
                  </div>
                </div>
              </div>
              <div className="border-b border-gray-200">
                <Tabs
                  variant="underline"
                  tabs={[
                    {
                      key: "history",
                      label: "History",
                      icon: (
                        <FontAwesomeIcon
                          icon={faScroll}
                          className="text-primary"
                        />
                      ),
                    },
                    {
                      key: "friends",
                      label: "Friends",
                      icon: (
                        <FontAwesomeIcon
                          icon={faUsers}
                          className="text-primary"
                        />
                      ),
                      badge: "15",
                    },
                    {
                      key: "achievements",
                      label: "Achievements",
                      icon: (
                        <FontAwesomeIcon
                          icon={faTrophy}
                          className="text-primary"
                        />
                      ),
                      badge: "8",
                    },
                  ]}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                />
              </div>
              <div className="p-6">
                {activeTab === "history" && (
                  <p className="text-sm text-gray-600">
                    Game history content...
                  </p>
                )}
                {activeTab === "friends" && (
                  <p className="text-sm text-gray-600">
                    Friends list content...
                  </p>
                )}
                {activeTab === "achievements" && (
                  <p className="text-sm text-gray-600">
                    Achievements content...
                  </p>
                )}
              </div>
            </Card>
          </div>
        </section>

        {/* AddFriendButton Section */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            AddFriendButton (Player Profile)
          </h2>

          <p className="text-sm text-gray-600 mb-4">
            This component shows the relationship status between the logged-in
            user and another player's profile. It provides context-aware actions
            based on the current relationship state.
          </p>

          <div className="p-4 bg-blue-50 rounded-lg mb-6">
            <p className="text-sm text-blue-800 mb-2">
              Component States (Design System - Borderless, Rounded-Full):
            </p>
            <ul className="text-xs text-gray-700 space-y-1 ml-4 list-disc">
              <li>
                <strong>No Relationship:</strong> Purple primary button (no
                borders, rounded-full)
              </li>
              <li>
                <strong>Friends:</strong> Chip-success green with dropdown menu
                (remove, block)
              </li>
              <li>
                <strong>Request Sent:</strong> Chip-warning yellow with dropdown
                (cancel, block)
              </li>
              <li>
                <strong>Request Received:</strong> Chip-warning yellow "Accept
                Request" with dropdown (reject, block)
              </li>
              <li>
                <strong>Blocked:</strong> Chip-error red with dropdown (unblock)
              </li>
              <li>
                <strong>Blocked By:</strong> Gray, disabled state (no
                interaction)
              </li>
              <li>
                <strong>Me (Own Profile):</strong> Chip-default gray
                (informational only)
              </li>
            </ul>
          </div>

          <p className="text-sm text-gray-600 mb-2">
            Visual Examples (Static Display)
          </p>
          <div className="space-y-4 mb-6">
            {/* Mock display of all states */}
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div>
                <span className="text-sm font-medium text-gray-900">
                  No Relationship
                </span>
                <p className="text-xs text-gray-500">
                  Click to send friend request
                </p>
              </div>
              <button className="inline-flex items-center justify-center btn-sm font-display font-bold uppercase tracking-wider rounded-full transition-all duration-200 bg-primary hover:bg-primary-hover text-white">
                + ADD FRIEND
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div>
                <span className="text-sm font-medium text-gray-900">
                  Friends
                </span>
                <p className="text-xs text-gray-500">
                  Click dropdown for more options
                </p>
              </div>
              <div className="inline-flex">
                <button className="inline-flex items-center justify-center btn-sm font-display font-bold uppercase tracking-wider rounded-l-full transition-all duration-200 bg-chip-success hover:bg-green-200 text-chip-success-text">
                  ✓ FRIENDS
                </button>
                <button className="inline-flex items-center justify-center px-2.5 py-2 font-display text-[10px] rounded-r-full -ml-1 transition-all duration-200 bg-chip-success hover:bg-green-200 text-chip-success-text">
                  ▼
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div>
                <span className="text-sm font-medium text-gray-900">
                  Request Sent
                </span>
                <p className="text-xs text-gray-500">
                  Waiting for other player to accept
                </p>
              </div>
              <div className="inline-flex">
                <button className="inline-flex items-center justify-center btn-sm font-display font-bold uppercase tracking-wider rounded-l-full transition-all duration-200 bg-chip-warning hover:bg-yellow-200 text-chip-warning-text">
                  ◌ REQUEST SENT
                </button>
                <button className="inline-flex items-center justify-center px-2.5 py-2 font-display text-[10px] rounded-r-full -ml-1 transition-all duration-200 bg-chip-warning hover:bg-yellow-200 text-chip-warning-text">
                  ▼
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div>
                <span className="text-sm font-medium text-gray-900">
                  Request Received
                </span>
                <p className="text-xs text-gray-500">
                  Click to accept, or use dropdown to reject/block
                </p>
              </div>
              <div className="inline-flex">
                <button className="inline-flex items-center justify-center btn-sm font-display font-bold uppercase tracking-wider rounded-l-full transition-all duration-200 bg-chip-warning hover:bg-yellow-200 text-chip-warning-text">
                  ◈ ACCEPT REQUEST
                </button>
                <button className="inline-flex items-center justify-center px-2.5 py-2 font-display text-[10px] rounded-r-full -ml-1 transition-all duration-200 bg-chip-warning hover:bg-yellow-200 text-chip-warning-text">
                  ▼
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div>
                <span className="text-sm font-medium text-gray-900">
                  Blocked
                </span>
                <p className="text-xs text-gray-500">Use dropdown to unblock</p>
              </div>
              <div className="inline-flex">
                <button className="inline-flex items-center justify-center btn-sm font-display font-bold uppercase tracking-wider rounded-l-full transition-all duration-200 bg-chip-error hover:bg-red-200 text-chip-error-text">
                  <FontAwesomeIcon icon={faBan} className="mr-1" /> BLOCKED
                </button>
                <button className="inline-flex items-center justify-center px-2.5 py-2 font-display text-[10px] rounded-r-full -ml-1 transition-all duration-200 bg-chip-error hover:bg-red-200 text-chip-error-text">
                  ▼
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div>
                <span className="text-sm font-medium text-gray-900">
                  Blocked By Other Player
                </span>
                <p className="text-xs text-gray-500">
                  Disabled state - no interaction possible
                </p>
              </div>
              <button
                disabled
                className="inline-flex items-center justify-center btn-sm font-display font-bold uppercase tracking-wider rounded-full transition-all duration-200 opacity-60 cursor-not-allowed bg-gray-200 text-gray-600"
              >
                — NOT AVAILABLE
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200 bg-blue-50">
              <div>
                <span className="text-sm font-medium text-gray-900">
                  Viewing Own Profile
                </span>
                <p className="text-xs text-gray-500">
                  Special state when user views their own profile
                </p>
              </div>
              <div className="btn-sm rounded-full font-display tracking-wide bg-chip-default text-chip-default-text">
                {"<-⭐ It's me Mario! 🍄"}
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">
              Usage in Player Profile:
            </p>
            <div className="bg-white p-3 rounded-md border">
              <code className="text-xs text-gray-800 block">
                {`<AddFriendButton
  currentUserId={user.id}
  targetId={profileId}
  csrfToken={csrfToken}
/>`}
              </code>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              The component automatically fetches the relationship status and
              displays the appropriate button state with context-aware actions.
            </p>
          </div>
        </section>

        {/* Design System Section - Tailwind v4 CSS Variable System */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            Design System (Tailwind v4 Theme)
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Color Palette */}
            <div className="p-4 bg-white rounded-lg border">
              <h3 className="font-medium mb-4 text-gray-900">Color Palette</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Primary (Purple)</p>
                  <div className="flex gap-2">
                    <div
                      className="w-16 h-10 bg-primary rounded"
                      title="bg-primary"
                    ></div>
                    <div
                      className="w-16 h-10 bg-primary-hover rounded"
                      title="bg-primary-hover"
                    ></div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Secondary (Gray)</p>
                  <div className="flex gap-2">
                    <div
                      className="w-16 h-10 bg-secondary rounded"
                      title="bg-secondary"
                    ></div>
                    <div
                      className="w-16 h-10 bg-secondary-hover rounded"
                      title="bg-secondary-hover"
                    ></div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Danger (Red)</p>
                  <div className="flex gap-2">
                    <div
                      className="w-16 h-10 bg-danger rounded"
                      title="bg-danger"
                    ></div>
                    <div
                      className="w-16 h-10 bg-danger-hover rounded"
                      title="bg-danger-hover"
                    ></div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Ghost</p>
                  <div className="flex gap-2">
                    <div
                      className="w-16 h-10 border-2 border-dashed border-gray-300 rounded"
                      title="bg-ghost (transparent)"
                    ></div>
                    <div
                      className="w-16 h-10 bg-ghost-hover rounded"
                      title="bg-ghost-hover"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chip Colors */}
            <div className="p-4 bg-white rounded-lg border">
              <h3 className="font-medium mb-4 text-gray-900">Chip Colors</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-20 h-8 bg-chip-default rounded flex items-center justify-center">
                    <span className="text-xs text-chip-default-text">
                      Default
                    </span>
                  </div>
                  <span className="text-xs text-gray-600">default</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-8 bg-chip-success rounded flex items-center justify-center">
                    <span className="text-xs text-chip-success-text">
                      Success
                    </span>
                  </div>
                  <span className="text-xs text-gray-600">success</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-8 bg-chip-warning rounded flex items-center justify-center">
                    <span className="text-xs text-chip-warning-text">
                      Warning
                    </span>
                  </div>
                  <span className="text-xs text-gray-600">warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-8 bg-chip-error rounded flex items-center justify-center">
                    <span className="text-xs text-chip-error-text">Error</span>
                  </div>
                  <span className="text-xs text-gray-600">error</span>
                </div>
              </div>
            </div>

            {/* Border & Focus Colors */}
            <div className="p-4 bg-white rounded-lg border">
              <h3 className="font-medium mb-4 text-gray-900">Border & Focus</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-2">Focus Ring</p>
                  <div className="w-full h-10 border-2 border-focus rounded"></div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-2">Border States</p>
                  <div className="flex gap-2">
                    <div className="flex-1 h-10 border border-border rounded"></div>
                    <div className="flex-1 h-10 border border-border-hover rounded"></div>
                    <div className="flex-1 h-10 border border-border-error rounded"></div>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <span className="flex-1 text-xs text-gray-600 text-center">
                      default
                    </span>
                    <span className="flex-1 text-xs text-gray-600 text-center">
                      hover
                    </span>
                    <span className="flex-1 text-xs text-gray-600 text-center">
                      error
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CSS Variable Reference */}
            <div className="p-4 bg-white rounded-lg border">
              <h3 className="font-medium mb-4 text-gray-900">
                Usage (Tailwind v4)
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">
                  Colors defined in{" "}
                  <code className="bg-gray-100 px-1 rounded">globals.css</code>{" "}
                  @theme block auto-generate utilities:
                </p>
                <div className="bg-gray-50 p-2 rounded mt-2 space-y-1">
                  <code className="text-xs text-gray-800 block">
                    --color-primary → bg-primary
                  </code>
                  <code className="text-xs text-gray-800 block">
                    --color-danger → text-danger
                  </code>
                  <code className="text-xs text-gray-800 block">
                    --color-border → border-border
                  </code>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Components use CVA (class-variance-authority) for type-safe
                  variants and cn() utility for className merging.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Responsive Test Section */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            Responsive (Resize to test)
          </h2>
          <div className="p-4 bg-white rounded-lg border">
            <p className="text-base md:text-lg text-gray-900 mb-2">
              Body text: text-base md:text-lg
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              Heading: text-xl md:text-2xl
            </p>
            <p className="text-sm md:text-base text-gray-600">
              Small: text-sm md:text-base
            </p>
            <p className="mt-4 text-sm md:text-base text-gray-600">
              Resize your browser to see the responsive breakpoints in action.
            </p>
          </div>
        </section>

        {/* Section Pattern */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            Section (Pattern Component)
          </h2>
          <div className="space-y-4">
            <Section
              variant="card"
              title="Player Stats"
              subtitle="Last 30 days"
            >
              <p className="text-sm text-gray-700">Card content here</p>
            </Section>
            <Section variant="elevated" title="Achievements" padding="lg">
              <p className="text-sm text-gray-700">Elevated card content</p>
            </Section>
          </div>
        </section>

        {/* ListRow Pattern */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            ListRow (Pattern Component)
          </h2>
          <div className="space-y-2">
            <ListRow variant="default">
              <Avatar size="sm" fallbackText="John" />
              <div className="flex-1">
                <p className="text-sm font-medium">Player Name</p>
                <p className="text-xs text-gray-500">Online</p>
              </div>
            </ListRow>
            <ListRow variant="highlighted">
              <Avatar size="sm" fallbackText="You" />
              <div className="flex-1">
                <p className="text-sm font-medium">Current User</p>
                <p className="text-xs text-gray-500">This is you</p>
              </div>
            </ListRow>
            <ListRow onClick={() => alert("Clicked!")}>
              <Avatar size="sm" fallbackText="Click" />
              <div className="flex-1">
                <p className="text-sm font-medium">Clickable Row</p>
                <p className="text-xs text-gray-500">Hover to see effect</p>
              </div>
            </ListRow>
          </div>
        </section>

        {/* EmptyState Pattern */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            EmptyState (Pattern Component)
          </h2>
          <div className="space-y-4">
            <EmptyState
              title="No games yet"
              description="Start playing to see your game history"
              icon={<FontAwesomeIcon icon={faGamepad} />}
            />
            <EmptyState
              title="No friends yet"
              description="Add friends to play together"
              icon={<FontAwesomeIcon icon={faUsers} />}
            >
              <Button variant="primary" size="sm">
                Add Friend
              </Button>
            </EmptyState>
          </div>
        </section>

        {/* LoadingState Pattern */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            LoadingState (Pattern Component)
          </h2>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4 items-center">
              <LoadingState variant="spinner" size="sm" />
              <LoadingState variant="spinner" size="md" />
              <LoadingState variant="spinner" size="lg" />
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <LoadingState variant="dots" size="sm" />
              <LoadingState variant="dots" size="md" />
              <LoadingState variant="dots" size="lg" text="Loading..." />
            </div>
            <div>
              <LoadingState variant="skeleton" size="md" />
            </div>
          </div>
        </section>

        <div className="mt-8 pt-8 border-t text-center text-sm md:text-base text-gray-600">
          <p>
            This is a development test page. Remove when components are
            implemented.
          </p>
        </div>
      </div>
    </div>
  );
}
