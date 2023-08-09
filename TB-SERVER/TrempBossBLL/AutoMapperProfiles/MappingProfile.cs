using AutoMapper;
using System.Linq;
using TrempBossBLL.DTOs;
using TrempBossDataAccess;

namespace TrempBossBLL.AutoMapperProfiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<User, UserDto>();

            CreateMap<Proc_Get_Tremps_Result, TrempDto>()
            .ForMember(destination => destination.tremp_type, options => options.MapFrom(src => src.tremp_type ? "driver" : "hitchhiker"))
            .ForMember(destination => destination.creator, options => options.MapFrom(source => new CreatorDto
            {
                creator_id = source.creator_id,
                first_name = source.creator_first_name,
                last_name = source.creator_last_name,
                image_URL = source.creator_image_url
            }));
        }
    }


    public static class MapperConfig
    {
        private static readonly IMapper _mapper;

        static MapperConfig()
        {
            var config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<MappingProfile>();
            });

            _mapper = config.CreateMapper();
        }

        public static IMapper Mapper => _mapper;
    }

}
