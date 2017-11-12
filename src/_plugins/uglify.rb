module Jekyll
  module Uglify
    def uglify(input)
      Uglifier.new.compile(input)
    end
  end
end

Liquid::Template.register_filter(Jekyll::Uglify)