namespace Atlas.Models;

public class BaseListViewModel
{
    public int[] ProvinceIds { get; set; }
    public int[] DomainIds { get; set; }
    public bool IsEnabled { get; set; } = true;
}