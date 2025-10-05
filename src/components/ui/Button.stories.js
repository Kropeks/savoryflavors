import React from 'react';
import { buttonVariants } from '@/lib/buttonStyles';
import Button from './Button';
import { Heart, ArrowRight, Star, Bookmark, Share2, Plus, Trash2, Edit } from 'lucide-react';

export default {
  title: 'Components/UI/Button',
  component: Button,
  argTypes: {
    variant: {
      control: {
        type: 'select',
        options: Object.keys(buttonVariants).filter(key => 
          typeof buttonVariants[key] === 'object' && 'base' in buttonVariants[key]
        ),
      },
    },
    size: {
      control: {
        type: 'select',
        options: ['sm', 'md', 'lg', 'xl'],
      },
    },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    asChild: { control: 'boolean' },
  },
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
    disabled: false,
    fullWidth: false,
    asChild: false,
  },
};

const Template = (args) => <Button {...args} />;

export const Default = Template.bind({});

// Show all variants in a grid
export const Variants = () => (
  <div className="space-y-8">
    <div>
      <h3 className="text-lg font-medium mb-4">Primary Variants</h3>
      <div className="flex flex-wrap gap-4 items-center">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="cta">Call to Action</Button>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-medium mb-4">Social Buttons</h3>
      <div className="flex flex-wrap gap-4 items-center">
        <Button variant="facebook">Continue with Facebook</Button>
        <Button variant="google">Sign in with Google</Button>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-medium mb-4">Recipe Actions</h3>
      <div className="flex flex-wrap gap-4 items-center">
        <Button variant="save">
          <Bookmark className="w-4 h-4 mr-2" />
          Save Recipe
        </Button>
        <Button variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button variant="ghost">
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button variant="ghost" className="text-red-600 hover:bg-red-50">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  </div>
);

export const Sizes = () => (
  <div className="flex flex-wrap items-center gap-4">
    <Button size="sm">Small</Button>
    <Button size="md">Medium</Button>
    <Button size="lg">Large</Button>
    <Button size="xl">Extra Large</Button>
  </div>
);

export const WithIcons = () => (
  <div className="space-y-4">
    <div className="flex flex-wrap gap-4">
      <Button leftIcon={Heart} variant="ghost" className="text-red-500">
        Add to Favorites
      </Button>
      <Button rightIcon={ArrowRight} variant="primary">
        Continue
      </Button>
      <Button leftIcon={Plus} variant="secondary">
        Add Recipe
      </Button>
    </div>
    <div className="flex flex-wrap gap-4">
      <Button leftIcon={Star} variant="ghost" className="text-amber-500">
        Rate this recipe
      </Button>
      <Button rightIcon={ArrowRight} variant="link">
        View all recipes
      </Button>
    </div>
  </div>
);

export const FullWidth = () => (
  <div className="space-y-4 max-w-md">
    <Button fullWidth>Full Width Button</Button>
    <Button variant="outline" fullWidth>
      Another Full Width Button
    </Button>
  </div>
);

export const Disabled = () => (
  <div className="flex flex-wrap gap-4">
    <Button disabled>Primary Disabled</Button>
    <Button variant="secondary" disabled>
      Secondary Disabled
    </Button>
    <Button variant="outline" disabled>
      Outline Disabled
    </Button>
    <Button variant="ghost" disabled>
      Ghost Disabled
    </Button>
    <Button variant="link" disabled>
      Link Disabled
    </Button>
  </div>
);

// Custom button with custom hover effect
export const CustomButton = () => (
  <Button
    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold"
    hoverEffect={{
      base: 'group',
      hover: 'hover:from-pink-600 hover:to-purple-600 hover:shadow-lg',
      focus: 'focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50',
      child: 'bg-white/20',
    }}
  >
    Custom Gradient Button
  </Button>
);
